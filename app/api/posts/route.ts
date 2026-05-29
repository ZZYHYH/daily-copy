import { NextRequest, NextResponse } from "next/server";
import { getRecentPosts, getPostsByCategory, getPostsByDate } from "@/lib/kv";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const date = searchParams.get("date");
  const limit = parseInt(searchParams.get("limit") || "30");

  try {
    let posts;

    if (date) {
      posts = await getPostsByDate(date);
    } else if (category) {
      posts = await getPostsByCategory(category);
    } else {
      posts = await getRecentPosts(limit);
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
