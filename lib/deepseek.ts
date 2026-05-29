const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

interface GeneratedCopy {
  title: string;
  content: string;
}

export async function generateCopy(
  category: string,
  date: string
): Promise<GeneratedCopy> {
  const prompt = `你是一个朋友圈文案专家。请为"${category}"类别生成今日文案。

要求：
- 输出 JSON 格式：{"title": "标题", "content": "正文"}
- 文案要走心、有共鸣、适合配图发朋友圈
- 字数控制在 50-150 字
- 不要用 emoji，保持文字简洁优美
- 标题要吸引人，正文要有深度

今日日期：${date}
类别：${category}`;

  const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

export const CATEGORIES = ["励志", "情感", "早安", "晚安"] as const;

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  励志: ["sunrise mountain", "running trail", "success", "determination"],
  情感: ["sunset romantic", "coffee shop", "rain window", "love"],
  早安: ["morning sunrise", "beautiful landscape", "nature morning"],
  晚安: ["night sky stars", "city night lights", "moon night"],
};
