import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const envContent = readFileSync(".env", "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
  const [key, ...val] = line.split("=");
  if (key && val.length) env[key.trim()] = val.join("=").trim();
});

const DEEPSEEK_KEY = env.DEEPSEEK_API_KEY;
const PIXABAY_KEY = env.PIXABAY_API_KEY;

const CATEGORIES = ["励志", "情感", "早安", "晚安", "日常"];
const POSTS_PER_CATEGORY = 4;
const KEEP_DAYS = 7;
const KEYWORDS = {
  励志: ["journal writing", "morning coffee desk", "plant growing", "walking path nature", "book reading window"],
  情感: ["couple walking sunset", "friends laughing cafe", "letter handwritten", "flower bouquet gift", "rainy day window"],
  早安: ["bedside table morning", "breakfast toast coffee", "sunlight curtain", "alarm clock morning", "yoga mat morning"],
  晚安: ["bedroom lamp night", "city view window night", "candle light evening", "tea cup evening", "starview rooftop"],
  日常: ["home cooking kitchen", "train window scenery", "street food market", "bicycle city street", "laundry balcony sun"],
};

async function generateCopy(category, index) {
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: `你是一个朋友圈文案专家。请为"${category}"类别生成第${index + 1}条今日文案，要有独特角度，不要重复。输出JSON：{"title":"标题","content":"正文"}。文案要走心、有共鸣、适合发朋友圈，50-150字，不用emoji。` }],
      temperature: 0.8, max_tokens: 500,
    }),
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  const match = text.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : { title: category + "文案", content: text };
}

async function downloadImage(keyword, filename) {
  try {
    const res = await fetch(`https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${keyword}&image_type=photo&orientation=horizontal&per_page=10&safesearch=true`);
    const data = await res.json();
    if (!data.hits || data.hits.length === 0) return "";
    const img = data.hits[Math.floor(Math.random() * data.hits.length)];
    const imgRes = await fetch(img.largeImageURL);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    writeFileSync(join(process.cwd(), "public/images", filename), buffer);
    return `/images/${filename}`;
  } catch (e) {
    console.log("Image error:", e.message);
    return "";
  }
}

function getWeekAgoDate() {
  const d = new Date();
  d.setDate(d.getDate() - KEEP_DAYS);
  return d.toISOString().split("T")[0];
}

async function main() {
  const today = new Date().toISOString().split("T")[0];
  const postsFile = join(process.cwd(), "public/data/posts.json");
  const existingPosts = existsSync(postsFile) ? JSON.parse(readFileSync(postsFile, "utf-8")) : [];
  
  const cutoff = getWeekAgoDate();
  const keptPosts = existingPosts.filter(p => p.date >= cutoff);
  console.log(`Keeping ${keptPosts.length} posts from last ${KEEP_DAYS} days (removed ${existingPosts.length - keptPosts.length} old posts).`);

  const newPosts = [];
  let imgIndex = 0;

  for (const cat of CATEGORIES) {
    for (let i = 0; i < POSTS_PER_CATEGORY; i++) {
      console.log(`Generating ${cat} #${i + 1}...`);
      const copy = await generateCopy(cat, i);
      const keywords = KEYWORDS[cat];
      const keyword = keywords[i % keywords.length];
      const filename = `${today}-${imgIndex++}.jpg`;
      const imageUrl = await downloadImage(keyword, filename);
      newPosts.push({
        id: crypto.randomUUID(), date: today, category: cat,
        title: copy.title, content: copy.content,
        image_url: imageUrl,
        image_author: "",
        created_at: new Date().toISOString(),
      });
    }
  }

  const allPosts = [...newPosts, ...keptPosts];
  writeFileSync(postsFile, JSON.stringify(allPosts, null, 2));
  console.log(`Done! Generated ${newPosts.length} new posts. Total: ${allPosts.length} posts.`);
}

main().catch(console.error);
