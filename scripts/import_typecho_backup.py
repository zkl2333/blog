from __future__ import annotations

import json
import re
import sys
from pathlib import Path


EXCLUDED_CIDS = {
    "295",
    "390",
    "411",
    "427",
    "440",
    "443",
    "539",
    "545",
    "560",
    "601",
    "619",
    "795",
    "833",
    "1629",
    "1831",
    "1861",
    "1863",
    "1884",
    "1931",
    "1934",
    "1935",
    "1937",
    "1973",
}

NOTE_CIDS = {
    "315",
    "552",
    "604",
    "622",
    "636",
    "701",
    "825",
    "963",
    "996",
    "1054",
    "1344",
    "1475",
    "1486",
    "1491",
    "1496",
    "1534",
    "1583",
    "1585",
    "1594",
    "1635",
    "1793",
    "1795",
    "1924",
    "1929",
    "1967",
    "1981",
    "1983",
    "2000",
}


def find_json_end(buffer: bytes, start: int) -> int:
    depth = 0
    in_string = False
    escaping = False

    for index in range(start, len(buffer)):
        char = buffer[index]

        if in_string:
            if escaping:
                escaping = False
                continue
            if char == 0x5C:
                escaping = True
                continue
            if char == 0x22:
                in_string = False
            continue

        if char == 0x22:
            in_string = True
            continue
        if char == 0x7B:
            depth += 1
            continue
        if char == 0x7D:
            depth -= 1
            if depth == 0:
                return index

    return -1


def parse_records(buffer: bytes) -> list[dict[str, str | None]]:
    records: list[dict[str, str | None]] = []
    needle = b'{"cid":'
    start = buffer.find(needle)

    while start != -1:
        json_end = find_json_end(buffer, start)
        if json_end == -1:
            break

        schema = json.loads(buffer[start : json_end + 1].decode("utf-8"))
        cursor = json_end + 1
        record: dict[str, str | None] = {}

        for field, length in schema.items():
            if length is None:
                record[field] = None
                continue

            size = int(length)
            record[field] = buffer[cursor : cursor + size].decode("utf-8")
            cursor += size

        records.append(record)
        start = buffer.find(needle, cursor)

    return records


def sanitize_slug(value: str | None, fallback: str) -> str:
    slug = (value or fallback).strip().lower()
    slug = re.sub(r'[\\/:*?"<>|]', "-", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug or fallback


def strip_markup(text: str) -> str:
    cleaned = re.sub(r"<!--[\s\S]*?-->", " ", text)
    cleaned = re.sub(r"<style[\s\S]*?</style>", " ", cleaned, flags=re.I)
    cleaned = re.sub(r"<script[\s\S]*?</script>", " ", cleaned, flags=re.I)
    cleaned = re.sub(r"!\[[^\]]*]\[[^\]]+]", " ", cleaned)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    cleaned = re.sub(r"!\[[^\]]*]\([^)]+\)", " ", cleaned)
    cleaned = re.sub(r"\[([^\]]+)]\[[^\]]+]", r"\1", cleaned)
    cleaned = re.sub(r"\[([^\]]+)]\([^)]+\)", r"\1", cleaned)
    cleaned = re.sub(r"^\s*\[[^\]]+]:\s+\S+\s*$", " ", cleaned, flags=re.M)
    cleaned = re.sub(r"[`*_>#-]", " ", cleaned)
    cleaned = re.sub(r"&nbsp;", " ", cleaned, flags=re.I)
    cleaned = re.sub(r"&[a-z]+;", " ", cleaned, flags=re.I)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


def build_description(title: str, body: str) -> str:
    plain = strip_markup(body)
    if not plain:
        return f"{title} - Typecho 备份恢复文章"
    return plain[:140]


def to_iso(value: str | None) -> str | None:
    if not value:
        return None

    try:
        seconds = int(value)
    except ValueError:
        return None

    if seconds <= 0:
        return None

    from datetime import datetime, timezone

    return datetime.fromtimestamp(seconds, timezone.utc).isoformat().replace("+00:00", "Z")


def yaml_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def build_markdown(record: dict[str, str | None], collection: str = "post") -> str:
    title = record.get("title") or "未命名文章"
    raw_body = record.get("text") or ""
    body = re.sub(r"^<!--markdown-->\s*", "", raw_body)
    publish_date = to_iso(record.get("created")) or "1970-01-01T00:00:00Z"
    updated_date = to_iso(record.get("modified"))
    description = build_description(title, body)
    is_draft = record.get("status") == "draft"

    frontmatter = [
        "---",
        f"title: {yaml_string(title)}",
        f"description: {yaml_string(description)}",
        f"publishDate: {yaml_string(publish_date)}",
    ]

    if collection == "post":
        frontmatter.append("tags: []")

    if collection == "post" and is_draft:
        frontmatter.append("draft: true")

    if collection == "post" and updated_date and updated_date != publish_date:
        frontmatter.append(f"updatedDate: {yaml_string(updated_date)}")

    frontmatter.extend(["---", ""])
    return "\n".join(frontmatter) + body.strip() + "\n"


def main() -> int:
    if len(sys.argv) < 2:
        print("用法: python scripts/import_typecho_backup.py <backup.dat> [output_dir]", file=sys.stderr)
        return 1

    backup_path = Path(sys.argv[1])
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("src/content/post")
    output_dir = output_dir.resolve()
    note_output_dir = Path("src/content/note").resolve()

    records = parse_records(backup_path.read_bytes())
    importable_statuses = {"publish", "draft"}
    posts = [
        record
        for record in records
        if record.get("type") == "post"
        and record.get("status") in importable_statuses
        and record.get("cid") not in EXCLUDED_CIDS
    ]

    output_dir.mkdir(parents=True, exist_ok=True)
    note_output_dir.mkdir(parents=True, exist_ok=True)

    written = 0
    written_notes = 0
    written_posts = 0
    used_targets: set[Path] = set()
    for post in posts:
        cid = post.get("cid") or "unknown"
        collection = "note" if cid in NOTE_CIDS else "post"
        target_dir = note_output_dir if collection == "note" else output_dir
        base_slug = sanitize_slug(cid, f"typecho-{cid}")
        target = target_dir / f"{base_slug}.md"

        if target in used_targets:
            target = target_dir / f"{base_slug}-{cid}.md"

        target.write_text(build_markdown(post, collection), encoding="utf-8")
        used_targets.add(target)
        written += 1
        if collection == "note":
            written_notes += 1
        else:
            written_posts += 1

    print(
        json.dumps(
            {
                "totalRecords": len(records),
                "importedPosts": len(posts),
                "written": written,
                "writtenNotes": written_notes,
                "writtenPosts": written_posts,
                "outputDir": str(output_dir),
                "noteOutputDir": str(note_output_dir),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
