// Renders the default site OG image at /social-card.png
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import satori, { type SatoriOptions } from "satori";
import RobotoMonoBold from "@/assets/roboto-mono-700.ttf";
import RobotoMono from "@/assets/roboto-mono-regular.ttf";
import { siteConfig } from "@/site.config";
import { ogMarkup } from "./og-image/_ogMarkup";

const getAssetPath = (fileName: string) => resolve(process.cwd(), "src", "assets", fileName);
const lxgwWenKaiLite = readFileSync(getAssetPath("lxgw-wenkai-lite-regular.ttf"));
const lxgwWenKaiLiteMedium = readFileSync(getAssetPath("lxgw-wenkai-lite-medium.ttf"));

const ogOptions: SatoriOptions = {
	fonts: [
		{ data: lxgwWenKaiLite, lang: "zh-CN", name: "LXGW WenKai Lite", style: "normal", weight: 400 },
		{
			data: lxgwWenKaiLiteMedium,
			lang: "zh-CN",
			name: "LXGW WenKai Lite",
			style: "normal",
			weight: 700,
		},
		{ data: Buffer.from(RobotoMono), name: "Roboto Mono", style: "normal", weight: 400 },
		{ data: Buffer.from(RobotoMonoBold), name: "Roboto Mono", style: "normal", weight: 700 },
	],
	height: 630,
	width: 1200,
};

export async function GET() {
	const subtitle = siteConfig.tagline ?? siteConfig.description;
	const svg = await satori(ogMarkup(siteConfig.title, subtitle), ogOptions);
	const pngBuffer = new Resvg(svg).render().asPng();
	return new Response(new Uint8Array(pngBuffer), {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}
