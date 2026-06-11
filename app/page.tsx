"use client";

import { useEffect, useState, useCallback } from "react";
import PostCard from "@/components/PostCard";
import CategoryNav from "@/components/CategoryNav";
import SearchBar from "@/components/SearchBar";

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
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const handleSearchResults = useCallback((results: Post[]) => {
    setSearchResults(results);
    setIsSearching(results.length !== posts.length);
  }, [posts.length]);

  const today = new Date().toISOString().split("T")[0];
  const displayPosts = isSearching ? searchResults : posts;
  const filteredPosts = category === "全部" ? displayPosts : displayPosts.filter((p) => p.category === category);
  const todayPosts = filteredPosts.filter((p) => p.date === today);
  const olderPosts = filteredPosts.filter((p) => p.date !== today);

  return (
    <div className="space-y-8">
      <SearchBar posts={posts} onSearchResults={handleSearchResults} />
      
      <div className="text-center">
        <CategoryNav activeCategory={category} onCategoryChange={setCategory} />
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-orange-300 border-t-orange-500" />
          <p className="text-gray-400 text-sm">正在加载...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl mx-4">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 text-lg">{isSearching ? "没有找到相关内容" : "暂无内容"}</p>
          <p className="text-gray-400 text-sm mt-2">
            {isSearching ? "试试其他关键词" : "内容将在每天23点自动更新"}
          </p>
        </div>
      ) : (
        <>
          {todayPosts.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-700 mb-5 flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 bg-gradient-to-r from-red-400 to-pink-500 rounded-full animate-pulse" />
                今日推荐
                <span className="text-xs text-gray-400 font-normal ml-auto">{todayPosts.length} 条</span>
              </h2>
              <div className="masonry">
                {todayPosts.map((post, i) => (
                  <div key={post.id} style={{ animationDelay: `${i * 0.1}s` }}>
                    <PostCard {...post} />
                  </div>
                ))}
              </div>
            </section>
          )}
          {olderPosts.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-700 mb-5 flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full" />
                历史内容
                <span className="text-xs text-gray-400 font-normal ml-auto">{olderPosts.length} 条</span>
              </h2>
              <div className="masonry">
                {olderPosts.map((post, i) => (
                  <div key={post.id} style={{ animationDelay: `${i * 0.05}s` }}>
                    <PostCard {...post} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
