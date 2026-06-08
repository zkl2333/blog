import type { Paragraph, Root, Text } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/** 匹配引文出处段开头：「——」「— 」「-- 」 */
const CITE_RE = /^(——|—\s|--\s)/;

/**
 * 把普通引用块里「单独成段、以 —— 开头」的末段，渲染成 <cite>（mono 小标签出处）。
 *
 *   > 引文内容。
 *   >
 *   > —— 出处
 *
 * 需在 remark-callout 之后运行（callout 引用块已转成 aside，不再是 blockquote）。
 * 出处必须用空行与引文正文分隔，单独成段。
 */
export const remarkBlockquoteCite: Plugin<[], Root> = () => (tree) => {
	visit(tree, "blockquote", (node) => {
		if (node.children.length < 2) return; // 至少「引文段 + 出处段」
		const last = node.children[node.children.length - 1];
		if (!last || last.type !== "paragraph") return;
		const firstText = (last as Paragraph).children[0];
		if (!firstText || firstText.type !== "text") return;
		if (!CITE_RE.test((firstText as Text).value)) return;
		last.data = { ...(last.data ?? {}), hName: "cite" };
	});
};
