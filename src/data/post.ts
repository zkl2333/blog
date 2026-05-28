import { type CollectionEntry, getCollection } from "astro:content";
import type { ImageMetadata } from "astro";

/** filter out draft posts based on the environment */
export async function getAllPosts(): Promise<CollectionEntry<"post">[]> {
	return await getCollection("post", ({ data }) => {
		return import.meta.env.PROD ? !data.draft : true;
	});
}

// ─── 自动封面 fallback ────────────────────────────────
// frontmatter 没设 coverImage 时，扫 markdown 正文第一张 ![]() 当封面。
// 本地图（./xxx.png）走 import.meta.glob 解析成 ImageMetadata，可被 <Image> 优化；
// 远程图（https://...）保持字符串，调用方用 <img> 渲染（绕开 image.domains 白名单约束）。
const postImageModules = import.meta.glob<{ default: ImageMetadata }>(
	"../content/post/**/*.{png,jpg,jpeg,webp,gif,avif,svg}",
	{ eager: true },
);

const FIRST_MD_IMAGE = /!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/;

export type EffectiveCover =
	| { kind: "local"; alt: string; src: ImageMetadata }
	| { kind: "remote"; alt: string; src: string };

export function getEffectiveCover(post: CollectionEntry<"post">): EffectiveCover | null {
	// 1. frontmatter 显式覆盖优先
	if (post.data.coverImage) {
		return {
			kind: "local",
			alt: post.data.coverImage.alt,
			src: post.data.coverImage.src,
		};
	}

	// 2. fallback：正文第一张 markdown 图
	const body = post.body;
	if (!body) return null;
	const match = body.match(FIRST_MD_IMAGE);
	if (!match) return null;

	const alt = match[1] || post.data.title;
	const src = match[2]?.trim();
	if (!src) return null;

	if (/^https?:\/\//i.test(src)) {
		return { kind: "remote", alt, src };
	}

	const cleanSrc = src.startsWith("./") ? src.slice(2) : src;
	const key = `../content/post/${post.id}/${cleanSrc}`;
	const mod = postImageModules[key];
	if (mod) {
		return { kind: "local", alt, src: mod.default };
	}

	return null;
}

/** Get tag metadata by tag name */
export async function getTagMeta(tag: string): Promise<CollectionEntry<"tag"> | undefined> {
	const tagEntries = await getCollection("tag", (entry) => {
		return entry.id === tag;
	});
	return tagEntries[0];
}

/** groups posts by year (based on option siteConfig.sortPostsByUpdatedDate), using the year as the key
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 */
export function groupPostsByYear(posts: CollectionEntry<"post">[]) {
	return Object.groupBy(posts, (post) => post.data.publishDate.getFullYear().toString());
}

/** returns all tags created from posts (inc duplicate tags)
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getAllTags(posts: CollectionEntry<"post">[]) {
	return posts.flatMap((post) => [...post.data.tags]);
}

/** returns all unique tags created from posts
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTags(posts: CollectionEntry<"post">[]) {
	return [...new Set(getAllTags(posts))];
}

/** returns a count of each unique tag - [[tagName, count], ...]
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTagsWithCount(posts: CollectionEntry<"post">[]): [string, number][] {
	return [
		...getAllTags(posts).reduce(
			(acc, t) => acc.set(t, (acc.get(t) ?? 0) + 1),
			new Map<string, number>(),
		),
	].sort((a, b) => b[1] - a[1]);
}

// ─── 分类 helpers ────────────────────────────────────────
/** 所有非空分类（去重） */
export function getUniqueCategories(posts: CollectionEntry<"post">[]): string[] {
	return [
		...new Set(
			posts.map((p) => p.data.category).filter((c): c is string => Boolean(c)),
		),
	];
}

/** [[categoryName, count], ...]，按文章数降序 */
export function getUniqueCategoriesWithCount(
	posts: CollectionEntry<"post">[],
): [string, number][] {
	const map = new Map<string, number>();
	for (const p of posts) {
		const c = p.data.category;
		if (c) map.set(c, (map.get(c) ?? 0) + 1);
	}
	return [...map].sort((a, b) => b[1] - a[1]);
}
