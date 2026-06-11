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

// 优化后的关键词：更中国化、更日常生活、风格更统一
// 每个类别使用相似的视觉风格，确保整体协调
const KEYWORDS = {
  励志: [
    "chinese city sunrise rooftop",    // 城市日出
    "chinese mountain fog morning",    // 山间晨雾
    "chinese park morning exercise",   // 晨练
    "chinese tea cup sunrise",         // 茶与日出
    "chinese bamboo forest light",     // 竹林光影
    "chinese lake reflection",         // 湖面倒影
    "chinese garden morning dew",      // 庭院露珠
    "chinese street morning run",      // 晨跑
  ],
  情感: [
    "chinese couple tea together",     // 一起喝茶
    "chinese old couple walking",      // 老人散步
    "chinese family dinner table",     // 家庭聚餐
    "chinese friends coffee chat",     // 朋友聊天
    "chinese rain window cup",         // 雨天窗边
    "chinese sunset balcony",          // 阳台夕阳
    "chinese letter handwritten",      // 手写信
    "chinese flower vase window",      // 窗台花瓶
  ],
  早安: [
    "chinese morning tea cup",         // 早茶
    "chinese breakfast noodles",       // 早餐面条
    "chinese morning window light",    // 晨光窗户
    "chinese plant morning dew",       // 植物晨露
    "chinese morning market",          // 早市
    "chinese morning park walk",       // 公园晨走
    "chinese morning coffee shop",     // 咖啡馆
    "chinese morning bread milk",      // 面包牛奶
  ],
  晚安: [
    "chinese night city lights",       // 城市夜景
    "chinese night tea cup lamp",      // 夜茶台灯
    "chinese night window moon",       // 窗外月亮
    "chinese night book lamp",         // 夜读台灯
    "chinese night street rain",       // 雨夜街道
    "chinese night balcony stars",     // 阳台星空
    "chinese night candle bath",       // 蜡烛泡澡
    "chinese night bedroom cozy",      // 温馨卧室
  ],
  日常: [
    "chinese cooking home kitchen",    // 家庭做饭
    "chinese reading book cafe",       // 咖啡馆读书
    "chinese market shopping bag",     // 买菜
    "chinese park bench sunny",        // 公园长椅
    "chinese home cleaning tidy",      // 收拾家务
    "chinese plant watering home",     // 浇花
    "chinese laundry window sun",      // 晾衣服
    "chinese cooking dumpling",        // 包饺子
  ],
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
    // 优化参数：更高质量、更相关的图片
    const params = new URLSearchParams({
      key: PIXABAY_KEY,
      q: keyword,
      image_type: "photo",
      orientation: "horizontal",
      per_page: "15",           // 更多选择
      safesearch: "true",
      min_width: "1200",        // 最小宽度保证质量
      min_height: "800",        // 最小高度保证质量
      editors_choice: "true",   // 编辑精选，质量更高
      order: "popular",         // 按热门排序，更优质
    });
    
    const res = await fetch(`https://pixabay.com/api/?${params}`);
    const data = await res.json();
    
    if (!data.hits || data.hits.length === 0) {
      // 如果没有结果，尝试更通用的关键词
      const fallbackParams = new URLSearchParams({
        key: PIXABAY_KEY,
        q: keyword.split(" ").slice(0, 2).join(" "),  // 只用前两个词
        image_type: "photo",
        orientation: "horizontal",
        per_page: "10",
        safesearch: "true",
        min_width: "800",
        min_height: "600",
        order: "popular",
      });
      
      const fallbackRes = await fetch(`https://pixabay.com/api/?${fallbackParams}`);
      const fallbackData = await fallbackRes.json();
      
      if (!fallbackData.hits || fallbackData.hits.length === 0) return "";
      
      const img = fallbackData.hits[Math.floor(Math.random() * Math.min(5, fallbackData.hits.length))];
      const imgRes = await fetch(img.largeImageURL);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      writeFileSync(join(process.cwd(), "public/images", filename), buffer);
      return `/images/${filename}`;
    }
    
    // 从前5张中随机选择，确保质量
    const img = data.hits[Math.floor(Math.random() * Math.min(5, data.hits.length))];
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
