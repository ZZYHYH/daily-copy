import { kv } from "@vercel/kv";

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
  const posts = await kv.get<Post[]>(POSTS_KEY);
  return posts || [];
}

export async function getRecentPosts(limit: number = 30): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export async function savePosts(newPosts: Post[]): Promise<void> {
  const existingPosts = await getAllPosts();
  const updatedPosts = [...newPosts, ...existingPosts];
  await kv.set(POSTS_KEY, updatedPosts);
}

export async function addPosts(newPosts: Post[]): Promise<void> {
  const existingPosts = await getAllPosts();
  const updatedPosts = [...newPosts, ...existingPosts];
  await kv.set(POSTS_KEY, updatedPosts);
}
