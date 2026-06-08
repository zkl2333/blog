import type { List, ListItem, PhrasingContent, Root } from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { h, isNodeDirective } from "../utils/remark";

function txt(value: string): PhrasingContent {
	return { type: "text", value };
}

/** 取 :::name[label] 的 label（首段带 directiveLabel），并从 children 移除 */
// biome-ignore lint/suspicious/noExplicitAny: directive node shape
function takeLabel(node: any): PhrasingContent[] | null {
	const first = node.children[0];
	if (
		first?.type === "paragraph" &&
		first.data &&
		"directiveLabel" in first.data &&
		first.children.length > 0
	) {
		node.children.splice(0, 1);
		return first.children;
	}
	return null;
}

/** 取容器内第一个列表，把每个列表项按 `|` 拆成字段数组 */
// biome-ignore lint/suspicious/noExplicitAny: directive node shape
function parseRows(node: any): string[][] {
	const list = node.children.find((c: { type: string }) => c.type === "list") as List | undefined;
	if (!list) return [];
	return list.children.map((li: ListItem) =>
		mdastToString(li)
			.split("|")
			.map((s) => s.trim()),
	);
}

/** 取容器内容里的行内内容（把段落拍平成 inline） */
// biome-ignore lint/suspicious/noExplicitAny: directive node shape
function inlineOf(children: any[]): PhrasingContent[] {
	return children.flatMap((c) => (c.type === "paragraph" ? c.children : [c]));
}

/**
 * 特稿 / 海报组件指令（暖色，复刻 置身钉内.html 的排版手法）：
 *   :::lead                       导语 / 题记
 *   :::act{no="I" sub="副标题"}    章节幕（mono 编号 + 大标题 + Bebas ghost 数字 + 副标题）
 *   :::quote[来源]                 pull quote 大字引文
 *   :::aside[标题]                 侧记盒子（标签骑左上角）
 *   :::vs  +  :::side[角色]{tone}  对比双栏 / 得失（tone=win|lose 出 ✓/✗ 与语义色）
 *   :::stats                       数据卡组（列表：值 | 标签 | danger?）
 *   :::steps                       编号步骤（列表：标题 | 描述）
 *   :::cards                       多栏卡（列表：标题 | 描述 | tone?）
 *
 * 全部用博客暖色 CSS 变量，亮暗自适应。仅作用于用到这些指令的文章，旧文章不受影响。
 */
export const remarkPoster: Plugin<[], Root> = () => (tree) => {
	visit(tree, (node, index, parent) => {
		if (!parent || index === undefined || !isNodeDirective(node)) return;
		if (node.type !== "containerDirective") return;
		const name = node.name;
		const attrs = (node.attributes ?? {}) as Record<string, string | null | undefined>;

		switch (name) {
			case "lead":
				parent.children[index] = h("div", { class: "pf-lead" }, node.children);
				return;

			case "act": {
				const no = attrs.no ?? "";
				const sub = attrs.sub ?? "";
				const titleInline = inlineOf(node.children);
				const head: ReturnType<typeof h>[] = [];
				if (no) head.push(h("div", { class: "pf-act__no" }, [txt(no)]));
				head.push(
					h("div", { class: "pf-act__title" }, [
						...titleInline,
						...(no
							? [h("span", { class: "pf-act__ghost", "aria-hidden": "true" }, [txt(no)])]
							: []),
					]),
				);
				if (sub) head.push(h("div", { class: "pf-act__sub" }, [txt(sub)]));
				parent.children[index] = h("div", { class: "pf-act" }, head);
				return;
			}

			case "quote": {
				const cite = takeLabel(node);
				const kids: ReturnType<typeof h>[] = [h("div", { class: "pf-quote__body" }, node.children)];
				if (cite) kids.push(h("div", { class: "pf-quote__src" }, cite));
				parent.children[index] = h("blockquote", { class: "pf-quote" }, kids);
				return;
			}

			case "aside": {
				const label = takeLabel(node) ?? [txt("侧记")];
				parent.children[index] = h("aside", { class: "pf-aside" }, [
					h("div", { class: "pf-aside__label" }, label),
					h("div", { class: "pf-aside__body" }, node.children),
				]);
				return;
			}

			case "vs":
				parent.children[index] = h("div", { class: "pf-vs not-prose" }, node.children);
				return;

			case "side": {
				const role = takeLabel(node);
				const tone = attrs.tone === "win" || attrs.tone === "lose" ? attrs.tone : "";
				const kids: ReturnType<typeof h>[] = [];
				if (role) {
					kids.push(
						h("div", { class: "pf-vs__role" }, [
							...(tone
								? [h("span", { class: "pf-vs__mk" }, [txt(tone === "win" ? "✓" : "✗")])]
								: []),
							...role,
						]),
					);
				}
				kids.push(h("div", { class: "pf-vs__body" }, node.children));
				parent.children[index] = h(
					"div",
					{ class: tone ? `pf-vs__col pf-vs__col--${tone}` : "pf-vs__col" },
					kids,
				);
				return;
			}

			case "stats": {
				const cards = parseRows(node).map(([value, label, flag]) =>
					h("div", { class: flag === "danger" ? "pf-stat pf-stat--danger" : "pf-stat" }, [
						h("span", { class: "pf-stat__value" }, [txt(value ?? "")]),
						h("span", { class: "pf-stat__label" }, [txt(label ?? "")]),
					]),
				);
				parent.children[index] = h("div", { class: "pf-stats not-prose" }, cards);
				return;
			}

			case "steps": {
				const rows = parseRows(node).map(([title, desc]) =>
					h("div", { class: "pf-step" }, [
						h("div", { class: "pf-step__title" }, [txt(title ?? "")]),
						h("div", { class: "pf-step__desc" }, [txt(desc ?? "")]),
					]),
				);
				parent.children[index] = h("div", { class: "pf-steps not-prose" }, rows);
				return;
			}

			case "cards": {
				const cards = parseRows(node).map(([title, desc, tone]) =>
					h("div", { class: tone ? `pf-card pf-card--${tone}` : "pf-card" }, [
						h("div", { class: "pf-card__title" }, [txt(title ?? "")]),
						h("div", { class: "pf-card__desc" }, [txt(desc ?? "")]),
					]),
				);
				parent.children[index] = h("div", { class: "pf-cards not-prose" }, cards);
				return;
			}
		}
	});
};
