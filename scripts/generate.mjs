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

// 城市生活可拍摄场景：每个人日常都能拍到的东西
const KEYWORDS = {
  励志: [
    "city sunrise window view",          // 窗外日出
    "morning coffee desk work",          // 桌上咖啡
    "city street morning walk",          // 清晨街道
    "sunrise balcony plant",             // 阳台植物日出
    "morning gym workout",               // 晨练健身
    "city skyline rooftop",              // 天台看城市
    "morning subway commute",            // 早高峰地铁
    "sunrise window curtain",            // 窗帘透光
  ],
  情感: [
    "couple walking city street",        // 情侣散步
    "friends dinner table",              // 朋友聚餐
    "rain window cup tea",               // 雨天窗边喝茶
    "sunset balcony plants",             // 阳台看夕阳
    "handwritten note desk",             // 手写便签
    "cat sleeping sofa",                 // 猫咪沙发
    "couple cooking kitchen",            // 一起做饭
    "family video call phone",           // 视频通话
  ],
  早安: [
    "morning coffee cup table",          // 早安咖啡
    "breakfast toast egg",               // 吐司鸡蛋
    "morning sunlight window",           // 晨光窗户
    "morning plant watering",            // 浇花
    "morning bread milk",                // 面包牛奶
    "morning fruit plate",               // 水果早餐
    "morning window view city",          // 窗外晨景
    "morning tea cup steam",             // 热茶蒸汽
  ],
  晚安: [
    "night city lights window",          // 窗外夜景
    "bedside lamp book",                 // 床头灯书
    "night tea cup warm",                // 夜晚热茶
    "night window moon",                 // 窗外月亮
    "night candle cozy room",            // 蜡烛温馨
    "night phone screen dark",           // 手机夜晚
    "night balcony stars",               // 阳台星空
    "night blanket cozy",                // 被窝温馨
  ],
  日常: [
    "cooking home kitchen",              // 家庭做饭
    "reading book sofa",                 // 沙发读书
    "shopping bag market",               // 买菜购物
    "park bench sunny day",              // 公园长椅
    "home cleaning organizing",          // 收拾家务
    "plant watering balcony",            // 阳台浇花
    "laundry drying window",             // 窗边晾衣
    "making dumplings home",             // 包饺子
  ],
};

// 每个类别有独立的文案风格指引
const PROMPTS = {
  励志: `你是一个朋友圈文案专家。请生成一条"励志"类别的文案。

风格要求：
- 主题：奋斗、坚持、成长、努力、不放弃
- 语气：积极向上，给人力量，但不要鸡汤
- 场景：上班族的日常感悟，早起、加班、学习、运动
- 避免：不要说教，不要用"加油"、"奥利给"等口号
- 示例风格："早起的地铁虽然挤，但至少方向是对的。"

文案要求：
1. 30-50字，简短精炼
2. 纯生活感悟，不涉及任何职业身份
3. 像朋友在分享日常，真实自然

输出JSON格式：{"title":"标题","content":"正文"}`,

  情感: `你是一个朋友圈文案专家。请生成一条"情感"类别的文案。

风格要求：
- 主题：亲情、友情、爱情、思念、陪伴
- 语气：温暖细腻，有共鸣感
- 场景：和朋友吃饭、和家人视频、想念某个人、雨天独处
- 避免：不要矫情，不要过度煽情，不要用"泪目"、"破防"
- 示例风格："下雨天，突然想给好久没联系的朋友发条消息。"

文案要求：
1. 30-50字，简短精炼
2. 纯生活感悟，不涉及任何职业身份
3. 像朋友在分享日常，真实自然

输出JSON格式：{"title":"标题","content":"正文"}`,

  早安: `你是一个朋友圈文案专家。请生成一条"早安"类别的文案。

风格要求：
- 主题：新的一天、清晨的美好、早餐、出门
- 语气：轻松愉悦，有活力
- 场景：起床、吃早餐、出门上班、晨练、喝咖啡
- 避免：不要用"元气满满"、"又是美好的一天"等套话
- 示例风格："今天的早餐是吐司加煎蛋，简单但满足。"

文案要求：
1. 30-50字，简短精炼
2. 纯生活感悟，不涉及任何职业身份
3. 像朋友在分享日常，真实自然

输出JSON格式：{"title":"标题","content":"正文"}`,

  晚安: `你是一个朋友圈文案专家。请生成一条"晚安"类别的文案。

风格要求：
- 主题：一天结束、放松、安静、夜晚的思绪
- 语气：平静温柔，有沉淀感
- 场景：洗完澡、躺在床上、关灯前、看窗外夜景
- 避免：不要用"晚安好梦"、"明天会更好"等套话
- 示例风格："洗完澡躺在床上，今天就到这里吧。"

文案要求：
1. 30-50字，简短精炼
2. 纯生活感悟，不涉及任何职业身份
3. 像朋友在分享日常，真实自然

输出JSON格式：{"title":"标题","content":"正文"}`,

  日常: `你是一个朋友圈文案专家。请生成一条"日常"类别的文案。

风格要求：
- 主题：做饭、打扫、逛街、发呆、生活琐事
- 语气：真实接地气，像在和朋友聊天
- 场景：做饭、买菜、收拾房间、阳台发呆、遛弯
- 避免：不要文艺腔，不要用"岁月静好"、"现世安稳"
- 示例风格："今天自己做了碗面，味道居然还不错。"

文案要求：
1. 30-50字，简短精炼
2. 纯生活感悟，不涉及任何职业身份
3. 像朋友在分享日常，真实自然

输出JSON格式：{"title":"标题","content":"正文"}`,
};

async function generateCopy(category, index) {
  const prompt = PROMPTS[category] || PROMPTS["日常"];
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK_KEY}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      max_tokens: 500,
    }),
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  const match = text.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : { title: category + "文案", content: text };
}

async function downloadImage(keyword, filename, usedImageIds = []) {
  try {
    const params = new URLSearchParams({
      key: PIXABAY_KEY,
      q: keyword,
      image_type: "photo",
      orientation: "horizontal",
      per_page: "20",
      safesearch: "true",
      min_width: "1200",
      min_height: "800",
      order: "popular",
    });
    
    const res = await fetch(`https://pixabay.com/api/?${params}`);
    const data = await res.json();
    
    let hits = data.hits || [];
    
    if (hits.length === 0) {
      const fallbackParams = new URLSearchParams({
        key: PIXABAY_KEY,
        q: keyword.split(" ").slice(0, 2).join(" "),
        image_type: "photo",
        orientation: "horizontal",
        per_page: "15",
        safesearch: "true",
        min_width: "800",
        min_height: "600",
        order: "popular",
      });
      
      const fallbackRes = await fetch(`https://pixabay.com/api/?${fallbackParams}`);
      const fallbackData = await fallbackRes.json();
      hits = fallbackData.hits || [];
    }
    
    if (hits.length === 0) return "";
    
    // 使用Pixabay图片ID去重
    const availableHits = hits.filter(h => !usedImageIds.includes(h.id));
    
    let selectedImg;
    if (availableHits.length === 0) {
      // 如果所有图片都已使用，随机选一张
      selectedImg = hits[Math.floor(Math.random() * hits.length)];
    } else {
      // 从可用图片中随机选择
      selectedImg = availableHits[Math.floor(Math.random() * Math.min(5, availableHits.length))];
    }
    
    // 记录已使用的图片ID
    usedImageIds.push(selectedImg.id);
    
    const imgRes = await fetch(selectedImg.largeImageURL);
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

  // 收集所有已使用的标题、内容和图片ID（包括今天已生成的）
  const usedTitles = new Set(keptPosts.map(p => p.title));
  const usedContents = new Set(keptPosts.map(p => p.content));
  const usedImageIds = [];  // 存储Pixabay图片ID
  
  console.log(`已存在 ${usedTitles.size} 个标题`);

  const newPosts = [];
  let imgIndex = 0;

  for (const cat of CATEGORIES) {
    const keywords = KEYWORDS[cat];
    let keywordIndex = 0;
    
    for (let i = 0; i < POSTS_PER_CATEGORY; i++) {
      console.log(`Generating ${cat} #${i + 1}...`);
      
      // 尝试生成不重复的文案（最多重试5次）
      let copy = null;
      let attempts = 0;
      const MAX_ATTEMPTS = 5;
      
      while (attempts < MAX_ATTEMPTS) {
        copy = await generateCopy(cat, i);
        attempts++;
        
        // 检查标题是否重复（严格匹配）
        if (!usedTitles.has(copy.title)) {
          break;
        }
        
        console.log(`  标题"${copy.title}"重复，重试第 ${attempts} 次...`);
        copy = null;
      }
      
      // 如果5次都重复，强制使用（添加序号后缀）
      if (!copy) {
        copy = await generateCopy(cat, i);
        const suffix = Math.random().toString(36).substring(2, 5);
        copy.title = `${copy.title}·${suffix}`;
        console.log(`  使用带后缀的标题: ${copy.title}`);
      }
      
      // 记录已使用的标题和内容
      usedTitles.add(copy.title);
      usedContents.add(copy.content);
      
      // 选择不重复的关键词
      let keyword = keywords[keywordIndex % keywords.length];
      keywordIndex++;
      
      const filename = `${today}-${imgIndex++}.jpg`;
      const imageUrl = await downloadImage(keyword, filename, usedImageIds);
      
      // 不需要在这里添加image ID，因为downloadImage内部已经处理了
      
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
