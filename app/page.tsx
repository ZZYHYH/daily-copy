"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import CategoryNav from "@/components/CategoryNav";

interface Post {
  id: string;
  date: string;
  category: string;
  title: string;
  content: string;
  image_url: string;
  image_author: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("全部");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/data/posts.json");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const filteredPosts = category === "全部" ? posts : posts.filter((p) => p.category === category);
  const todayPosts = filteredPosts.filter((p) => p.date === today);
  const olderPosts = filteredPosts.filter((p) => p.date !== today);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <CategoryNav activeCategory={category} onCategoryChange={setCategory} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">暂无内容</p>
          <p className="text-gray-400 text-sm mt-2">内容将在每天凌晨自动生成</p>
        </div>
      ) : (
        <>
          {todayPosts.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                今日推荐
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todayPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </section>
          )}
          {olderPosts.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-4">历史内容</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {olderPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
