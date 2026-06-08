import type { Properties } from "hastscript";
import type { Paragraph, PhrasingContent, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { h } from "../utils/remark";

/** Obsidian / GitHub callout 类型别名 → 规范类型 */
const ALIASES: Record<string, string> = {
	note: "note",
	info: "info",
	todo: "todo",
	tip: "tip",
	hint: "tip",
	important: "important",
	success: "success",
	check: "success",
	done: "success",
	question: "question",
	help: "question",
	faq: "question",
	warning: "warning",
	caution: "warning",
	attention: "warning",
	failure: "failure",
	fail: "failure",
	missing: "failure",
	danger: "danger",
	error: "danger",
	bug: "danger",
	example: "example",
	quote: "quote",
	cite: "quote",
	abstract: "abstract",
	summary: "abstract",
	tldr: "abstract",
};

function cap(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * 把 Obsidian / GitHub 风格的 callout 引用块转成 callout 容器：
 *
 *   > [!note] 标题          → <aside class="callout" data-callout="note">
 *   > [!warning]- 折叠标题   → <details class="callout">（- 默认折叠，+ 默认展开）
 *
 * 注意：markdown 会把 `[!note]` 解析成「未定义的 linkReference」而非纯 text，
 * 因此这里同时处理 linkReference 和 text 两种首节点形态。
 * 普通引用块（不以 [!type] 开头）保持原样。
 */
export const remarkCallout: Plugin<[], Root> = () => (tree) => {
	visit(tree, "blockquote", (node, index, parent) => {
		if (!parent || index === undefined) return;

		const firstPara = node.children[0];
		if (!firstPara || firstPara.type !== "paragraph") return;
		const kids = (firstPara as Paragraph).children;
		const first = kids[0];

		let type: string | undefined;
		if (
			first?.type === "linkReference" &&
			typeof first.identifier === "string" &&
			first.identifier.startsWith("!")
		) {
			// `[!note]` 形态：整段开头是一个 linkReference，identifier 为 "!note"
			type = ALIASES[first.identifier.slice(1).toLowerCase()];
			if (!type) return;
			kids.shift();
		} else if (first?.type === "text") {
			// 退路：`[!note]` 作为纯文本出现
			const m = first.value.match(/^\[!(\w+)\]/);
			const rawType = m?.[1];
			if (!m || !rawType) return;
			type = ALIASES[rawType.toLowerCase()];
			if (!type) return;
			first.value = first.value.slice(m[0]?.length ?? 0);
		} else {
			return;
		}

		// 紧跟的 text 里解析折叠符 + 自定义标题（首行），其余作为正文
		let fold = "";
		let titleNodes: PhrasingContent[] = [];
		const head = kids[0];
		if (head?.type === "text") {
			const hm = head.value.match(/^([+-]?)[ \t]*([^\n]*)(\n[\s\S]*)?$/);
			if (hm) {
				fold = hm[1] ?? "";
				const titleStr = (hm[2] ?? "").trim();
				if (titleStr) titleNodes = [{ type: "text", value: titleStr }];
				head.value = hm[3] ? hm[3].replace(/^\n/, "") : "";
			}
		}
		if (titleNodes.length === 0) {
			titleNodes = [{ type: "text", value: cap(type) }];
		}

		// 清理：去掉空的前导 text 与空的首段
		if (kids[0]?.type === "text" && kids[0].value === "") kids.shift();
		const para0 = node.children[0];
		if (para0?.type === "paragraph" && para0.children.length === 0) {
			node.children.shift();
		}

		const titleEl = h(fold ? "summary" : "div", { class: "callout-title" }, titleNodes);
		const bodyEl = h("div", { class: "callout-content" }, node.children);

		const props: Properties = { class: "callout", "data-callout": type };
		if (fold === "+") props.open = true;

		parent.children[index] = h(fold ? "details" : "aside", props, [titleEl, bodyEl]);
	});
};
