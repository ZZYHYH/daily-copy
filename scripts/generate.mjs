import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

// 支持环境变量（GitHub Actions）和 .env 文件（本地开发）
function loadEnv() {
  // 优先使用环境变量
  if (process.env.DEEPSEEK_API_KEY && process.env.PIXABAY_API_KEY) {
    return {
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
      PIXABAY_API_KEY: process.env.PIXABAY_API_KEY,
    };
  }
  // 回退到 .env 文件
  if (existsSync(".env")) {
    const envContent = readFileSync(".env", "utf-8");
    const env = {};
    envContent.split("\n").forEach(line => {
      const [key, ...val] = line.split("=");
      if (key && val.length) env[key.trim()] = val.join("=").trim();
    });
    return env;
  }
  return {};
}

const env = loadEnv();
const DEEPSEEK_KEY = env.DEEPSEEK_API_KEY;
const PIXABAY_KEY = env.PIXABAY_API_KEY;

const CATEGORIES = ["励志", "情感", "早安", "晚安", "日常"];
const POSTS_PER_CATEGORY = 4;
const KEEP_DAYS = 6; // 保留最近7天（含今天）
const KEYWORDS = {
  励志: ["mountain sunrise", "ocean waves", "forest path", "city skyline", "running athlete", "sunrise over sea", "climbing mountain", "starlit sky"],
  情感: ["couple walking", "sunset beach", "flower garden", "rainy window", "candle light", "old book", "vintage letter", "warm coffee"],
  早安: ["morning coffee", "sunrise window", "breakfast table", "garden morning", "yoga mat", "fresh juice", "morning walk", "bird singing"],
  晚安: ["night sky", "moon reflection", "cozy bedroom", "candle night", "starry sky", "city lights", "pajamas tea", "bed lamp"],
  日常: ["cooking kitchen", "reading book", "park bench", "bicycle ride", "market shopping", "home garden", "coffee shop", "weekend picnic"],
};

async function generateCopy(category, index) {
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: `你是一个朋友圈文案专家。请为"${category}"类别生成第${index + 1}条今日文案。

文案要求：
1. 纯生活感悟，不涉及任何职业身份
2. 30-50字，简短精炼
3. 像朋友在分享日常，真实自然
4. 结尾多样化：可以是反问、感叹、金句、省略号、或者自然收尾，不要每条都用反问
5. 避免使用"小确幸"、"治愈"、"人间值得"等过度使用的网络热词
6. 可以适当加入emoji表情，但不要过多
7. 文案风格：温暖、真实、有生活气息

输出JSON格式：{"title":"标题","content":"正文"}` }],
      temperature: 0.9,
      max_tokens: 500,
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

function getCutoffDate() {
  const d = new Date();
  d.setDate(d.getDate() - KEEP_DAYS);
  return d.toISOString().split("T")[0];
}

async function main() {
  const today = new Date().toISOString().split("T")[0];
  const postsFile = join(process.cwd(), "public/data/posts.json");
  const existingPosts = existsSync(postsFile) ? JSON.parse(readFileSync(postsFile, "utf-8")) : [];
  
  const cutoff = getCutoffDate();
  const keptPosts = existingPosts.filter(p => p.date >= cutoff);
  console.log(`保留最近7天的 ${keptPosts.length} 条内容（删除了 ${existingPosts.length - keptPosts.length} 条过期内容）`);

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
