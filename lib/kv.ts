import { Redis } from "@upstash/redis";

let redis: Redis | null = function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    });
  }
  return redis;
} as unknown as Redis;

function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    });
  }
  return redis;
}

export interface Post {
  id: string;
  date: string;
  category: string;
  title: string;
  content: string;
  image_url: string;
  image_author: string;
  created_at: string;
}

const POSTS_KEY = "daily_posts";
const KEEP_DAYS = 6; // 保留最近7天（含今天）

function getCutoffDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - KEEP_DAYS);
  return d.toISOString().split("T")[0];
}

export async function getPostsByDate(date: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.date === date);
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.category === category);
}

export async function getAllPosts(): Promise<Post[]> {
  const posts = await getRedisClient().get<Post[]>(POSTS_KEY);
  return posts || [];
}

export async function getRecentPosts(limit: number = 30): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export async function addPosts(newPosts: Post[]): Promise<void> {
  const existingPosts = await getAllPosts();
  const cutoff = getCutoffDate();
  const keptPosts = existingPosts.filter((p) => p.date >= cutoff);
  const updatedPosts = [...newPosts, ...keptPosts];
  await getRedisClient().set(POSTS_KEY, updatedPosts);
  console.log(`KV: Added ${newPosts.length} posts, kept ${keptPosts.length}, removed ${existingPosts.length - keptPosts.length}. Total: ${updatedPosts.length}`);
}
