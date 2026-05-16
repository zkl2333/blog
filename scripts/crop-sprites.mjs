import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/**
 * Crop named regions out of public/illustrations/sprites.png.
 * Run with: `node scripts/crop-sprites.mjs`
 *
 * Coordinates are calibrated against a 1536 x 1024 source sheet.
 * Add new regions here when you want more illustrations.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, "..", "public", "illustrations", "sprites.png");
const outputDir = join(__dirname, "..", "public", "illustrations");

const regions = [
	{ name: "bowl", x: 50, y: 350, w: 320, h: 220 },
	{ name: "plant", x: 1080, y: 600, w: 180, h: 210 },
	{ name: "book", x: 1280, y: 640, w: 220, h: 180 },
	{ name: "coffee", x: 1170, y: 350, w: 280, h: 200 },
	{ name: "blueprint", x: 510, y: 350, w: 380, h: 220 },
];

await mkdir(outputDir, { recursive: true });

const meta = await sharp(inputPath).metadata();
console.log("source:", meta.width, "x", meta.height);

for (const r of regions) {
	const w = Math.min(r.w, meta.width - r.x);
	const h = Math.min(r.h, meta.height - r.y);
	const out = join(outputDir, `${r.name}.png`);
	await sharp(inputPath).extract({ left: r.x, top: r.y, width: w, height: h }).toFile(out);
	console.log(`✓ ${r.name}.png ${w}x${h}`);
}
