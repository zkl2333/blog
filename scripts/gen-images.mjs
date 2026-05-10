/**
 * 用 AiHubMix 的 web-gpt-image-2 接口（chat/completions 形式）
 * 生成博客插画。$0.005 / 图。
 *
 * 用法：
 *   AIHUBMIX_API_KEY=sk-xxx node scripts/gen-images.mjs            # 全量
 *   AIHUBMIX_API_KEY=sk-xxx node scripts/gen-images.mjs hero-scene # 只跑一个
 *   AIHUBMIX_API_KEY=sk-xxx node scripts/gen-images.mjs --list     # 列出
 *
 * 输出：public/illustrations/<name>.png
 */

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "illustrations");

const API_KEY = process.env.AIHUBMIX_API_KEY;
if (!API_KEY) {
	console.error("缺 AIHUBMIX_API_KEY 环境变量");
	process.exit(1);
}

const STYLE_ANCHOR = `Watercolor illustration with delicate ink line work, slightly imperfect hand-drawn feel.
Warm pastel palette only: cream beige, soft coral orange, sage green, warm chocolate brown, butter yellow.
Soft drop shadow under the subject. 2-3 tiny gold 4-pointed sparkles scattered nearby.
Transparent background (no painted backdrop, no rectangular frame, just the object floating).
Cozy, Ghibli-adjacent, storybook feel. Subject centered with generous breathing room.
Output: PNG with transparent background.`;

const TASKS = {
	"hero-scene": {
		size: "1536x1024",
		subject: `A wooden tabletop corner shown from a slight 3/4 top-down angle.
On it: a steaming ramen bowl with soft-boiled egg on the left,
an open laptop with a glowing pastel screen in the center,
a small potted succulent on the right back,
a stacked pair of books with a coffee mug on top behind,
a wooden chair back peeking up from behind.
Tiny gold sparkles drifting upward.
Composition: leave the right third lighter / less dense so text can sit there.`,
	},
	breakfast: {
		size: "1024x1024",
		subject: `A round off-white ceramic plate with one sunny-side-up fried egg
(jiggly bright yolk), two slightly browned grilled pork sausages,
a small sprig of coriander as garnish.
The plate sits on a soft red-and-white gingham checkered tablecloth (warm tone, not saturated).
Beside the plate, a tall frosted glass of iced milk with a paper straw.
Slightly tilted top-down 3/4 view.`,
	},
	"about-desk": {
		size: "1536x1024",
		subject: `A small still life on a warm wooden desk:
a brass desk lamp with warm golden glow on the left,
an open MacBook-style laptop center showing soft pastel UI,
a small potted plant on the right (succulent),
a closed book + tiny coffee mug behind the laptop,
a tiny pebble robot mascot beside.
3/4 perspective. Mood: a calm evening study session.`,
	},
	robot: {
		size: "1024x1024",
		subject: `A small chubby pebble-shaped robot with rounded gray body,
two big round black eyes, a small antenna on the head, slightly tilted head, sitting still.`,
	},
	lightbulb: {
		size: "1024x1024",
		subject: `A vintage incandescent lightbulb with warm yellow glow inside,
soft golden halo around it, glass slightly textured, a tiny paw print decal on the side.`,
	},
	duck: {
		size: "1024x1024",
		subject: `A small bright yellow rubber duck with simple round eyes and orange beak,
beside a tiny soft pink speech bubble shape.`,
	},
	palette: {
		size: "1024x1024",
		subject: `A wooden oval artist's palette with 5 dabs of paint
(coral, yellow, sage green, sky blue, warm brown), a tiny brush resting on top.`,
	},
	envelope: {
		size: "1024x1024",
		subject: `A small cream-colored paper envelope with slightly worn corners,
sealed with a coral wax stamp shaped like a tiny bowl.`,
	},
};

const requested = process.argv.slice(2);
if (requested[0] === "--list") {
	console.log("可用 key:", Object.keys(TASKS).join(", "));
	process.exit(0);
}
const targets = requested.length ? requested : Object.keys(TASKS);

async function gen(key, task) {
	const prompt = `${STYLE_ANCHOR}\n\nSubject: ${task.subject}\n\nImage size: ${task.size}.`;
	const res = await fetch("https://aihubmix.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${API_KEY}`,
		},
		body: JSON.stringify({
			model: "web-gpt-image-2",
			messages: [{ role: "user", content: prompt }],
			stream: false,
		}),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
	}

	const data = await res.json();
	const content = data?.choices?.[0]?.message?.content ?? "";
	const m = content.match(/!\[[^\]]*\]\((https?:\/\/[^)]+\.(?:png|jpg|jpeg|webp))\)/i);
	if (!m) {
		throw new Error(`No image URL in response: ${content.slice(0, 200)}`);
	}
	const url = m[1];

	const imgRes = await fetch(url);
	if (!imgRes.ok) {
		throw new Error(`Image fetch HTTP ${imgRes.status}`);
	}
	const buf = Buffer.from(await imgRes.arrayBuffer());
	const out = join(outDir, `${key}.png`);
	await writeFile(out, buf);
	const kb = (buf.length / 1024).toFixed(1);
	console.log(`✓ ${key}.png  ${kb} KB  (${url})`);
}

await mkdir(outDir, { recursive: true });

for (const key of targets) {
	const task = TASKS[key];
	if (!task) {
		console.warn(`! 未知 key: ${key}`);
		continue;
	}
	const t0 = Date.now();
	try {
		await gen(key, task);
		console.log(`  耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
	} catch (err) {
		console.error(`✗ ${key}:`, err.message, "\n");
	}
}
