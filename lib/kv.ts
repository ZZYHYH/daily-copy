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
  const updatedPosts = [...newPosts, ...existingPosts];
  await getRedisClient().set(POSTS_KEY, updatedPosts);
}
