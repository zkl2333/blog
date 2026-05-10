/**
 * Generate cover images for pinned posts.
 * Output to src/content/post/ for astro image() loader.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "src", "content", "post");

const API_KEY = process.env.AIHUBMIX_API_KEY;
if (!API_KEY) { console.error("缺 AIHUBMIX_API_KEY"); process.exit(1); }

const STYLE_ANCHOR = `Watercolor illustration with delicate ink line work, slightly imperfect hand-drawn feel.
Warm pastel palette only: cream beige, soft coral orange, sage green, warm chocolate brown, butter yellow.
Soft drop shadow under the subject. 2-3 tiny gold 4-pointed sparkles scattered nearby.
Transparent background (no painted backdrop, no rectangular frame, just the object floating).
Cozy, Ghibli-adjacent, storybook feel. Subject centered with generous breathing room.
Output: PNG with transparent background, 1536x1024.`;

const TASKS = {
  "cover-hermes-curator": `A miniature gallery wall scene viewed straight-on.
5-6 small framed watercolor "skill cards" hang on a warm cream wall in two rows.
In front of the wall stands a small slim robot (clean geometric shape, NOT round or chubby —
thin rectangular body, simple stick limbs) wearing a tiny beret, holding a magnifying glass up to one card.
A tiny clipboard leans against the wall. 2 cards on the floor with soft red X marks.
Warm museum lighting, top-down spotlight glow. Keep the robot small relative to the scene.`,

  "cover-hermes-skill-auto-generation": `A cozy garden scene: a small round robot sitting beside a potted plant that is
growing wildly with many tangled branches (representing auto-generated skills).
The robot looks slightly overwhelmed, holding tiny pruning shears.
Vines with tiny tag labels hanging from branches. A watering can nearby.
Mood: organic growth that needs tending, warm afternoon light.`,
};

async function gen(key, subject) {
  const prompt = `${STYLE_ANCHOR}\n\nSubject: ${subject}\n\nImage size: 1536x1024.`;
  const res = await fetch("https://aihubmix.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({ model: "web-gpt-image-2", messages: [{ role: "user", content: prompt }], stream: false }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "";
  const m = content.match(/!\[[^\]]*\]\((https?:\/\/[^)]+\.(?:png|jpg|jpeg|webp))\)/i);
  if (!m) throw new Error(`No image URL: ${content.slice(0, 200)}`);
  const imgRes = await fetch(m[1]);
  if (!imgRes.ok) throw new Error(`Image fetch HTTP ${imgRes.status}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  await writeFile(join(outDir, `${key}.png`), buf);
  console.log(`✓ ${key}.png  ${(buf.length/1024).toFixed(1)} KB`);
}

for (const [key, subject] of Object.entries(TASKS)) {
  const t0 = Date.now();
  try {
    await gen(key, subject);
    console.log(`  耗时 ${((Date.now()-t0)/1000).toFixed(1)}s\n`);
  } catch (err) {
    console.error(`✗ ${key}:`, err.message, "\n");
  }
}
