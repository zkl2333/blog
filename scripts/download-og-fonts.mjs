import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

const version = "067a6d508532cc0f8bc79e899ec3b06ff4dee38a";
const baseUrl = `https://cdn.jsdelivr.net/gh/lxgw/LxgwWenKai-Lite@${version}/fonts/TTF`;

const fonts = [
	{
		file: "src/assets/lxgw-wenkai-lite-regular.ttf",
		url: `${baseUrl}/LXGWWenKaiLite-Regular.ttf`,
	},
	{
		file: "src/assets/lxgw-wenkai-lite-medium.ttf",
		url: `${baseUrl}/LXGWWenKaiLite-Medium.ttf`,
	},
];

async function download({ file, url }) {
	const outputPath = resolve(file);
	if (existsSync(outputPath)) {
		console.log(`OG font already exists: ${file}`);
		return;
	}

	mkdirSync(dirname(outputPath), { recursive: true });

	const response = await fetch(url);
	if (!response.ok || !response.body) {
		throw new Error(`Failed to download OG font: ${url}`);
	}

	await finished(Readable.fromWeb(response.body).pipe(createWriteStream(outputPath)));
	console.log(`Downloaded OG font: ${file}`);
}

await Promise.all(fonts.map(download));
