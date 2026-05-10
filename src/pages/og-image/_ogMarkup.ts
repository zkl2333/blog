import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { html } from "satori-html";
import { siteConfig } from "@/site.config";

const logoBase64 = readFileSync(
	resolve(process.cwd(), "public", "illustrations", "logo-bowl-256.png"),
).toString("base64");
const logoSrc = `data:image/png;base64,${logoBase64}`;

// satori-html 用 ultrahtml 解析，会把 text 节点里的 & 转成 &amp;。
// 递归把 text 节点的 HTML 实体解码回去，保证标题里的 "&" 能正确显示。
const decodeEntities = (s: string) =>
	s
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");

type VNode = { type?: string; props?: { children?: unknown } } | string | null | undefined;

const decodeTree = (node: VNode): VNode => {
	if (node == null) return node;
	if (typeof node === "string") return decodeEntities(node);
	if (typeof node !== "object") return node;
	const { props } = node;
	if (props && "children" in props) {
		const c = props.children;
		props.children = Array.isArray(c)
			? c.map((x) => decodeTree(x as VNode))
			: decodeTree(c as VNode);
	}
	return node;
};

export const ogMarkup = (title: string, subtitle: string) =>
	decodeTree(html`<div
		lang="zh-CN"
		style="font-family: 'LXGW WenKai Lite', 'Roboto Mono'"
		tw="flex w-full h-full bg-[#f6efe4] text-[#3d2f24]"
	>
		<div tw="flex w-3 h-full bg-[#d97757]"></div>

		<div tw="flex flex-col flex-1 h-full">
			<div tw="flex flex-col flex-1 px-20 pt-20 pb-12 justify-center">
				<p tw="flex text-3xl mb-8 text-[#8a6d56]">${subtitle}</p>
				<h1 tw="flex text-7xl font-bold leading-snug text-[#2a1f17]">${title}</h1>
			</div>

			<div tw="flex items-center justify-between px-20 py-8 border-t-2 border-[#e6d4be] text-2xl">
				<div tw="flex items-center">
					<img src="${logoSrc}" tw="w-18 h-18" />
					<p tw="flex ml-4 font-semibold text-[#2a1f17]">${siteConfig.title}</p>
				</div>
				<p tw="flex text-[#8a6d56]">by ${siteConfig.author}</p>
			</div>
		</div>
	</div>`);
