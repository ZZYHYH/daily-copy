"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPosts();
    }
  }, [slug]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?category=${encodeURIComponent(slug)}`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const categoryNames: Record<string, string> = {
    励志: "励志文案",
    情感: "情感文案",
    早安: "早安文案",
    晚安: "晚安文案",
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <CategoryNav />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {categoryNames[slug] || slug}
        </h1>
        <p className="text-gray-500 mt-2">共 {posts.length} 条内容</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">该分类暂无内容</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}
    </div>
  );
}
