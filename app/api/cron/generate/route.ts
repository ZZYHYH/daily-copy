import { NextRequest, NextResponse } from "next/server";
import { generateCopy, CATEGORIES, CATEGORY_KEYWORDS } from "@/lib/deepseek";
import { getRandomImage } from "@/lib/pixabay";
import { generateTextImage } from "@/lib/image-generator";
import { addPosts, Post } from "@/lib/kv";
import { put } from "@vercel/blob";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const newPosts: Post[] = [];

    const categoriesToGenerate = CATEGORIES.slice(0, 3);

    for (const category of categoriesToGenerate) {
      const copy = await generateCopy(category, today);

      const keywords = CATEGORY_KEYWORDS[category];
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      const image = await getRandomImage(randomKeyword);

      if (!image) {
        console.error(`No image found for category: ${category}`);
        continue;
      }

      const imageBuffer = await generateTextImage(
        image.largeImageURL,
        copy.title,
        copy.content
      );

      const blob = await put(
        `posts/${today}/${category}-${Date.now()}.jpg`,
        imageBuffer,
        {
          contentType: "image/jpeg",
          access: "public",
        }
      );

      const post: Post = {
        id: crypto.randomUUID(),
        date: today,
        category,
        title: copy.title,
        content: copy.content,
        image_url: blob.url,
        image_author: image.user,
        created_at: new Date().toISOString(),
      };

      newPosts.push(post);
    }

    if (newPosts.length > 0) {
      await addPosts(newPosts);
    }

    return NextResponse.json({
      success: true,
      date: today,
      postsGenerated: newPosts.length,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
