"use client";

import { useState, useMemo } from "react";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface SearchBarProps {
  posts: Post[];
  onSearchResults: (results: Post[]) => void;
}

export default function SearchBar({ posts, onSearchResults }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      onSearchResults(posts);
      return [];
    }

    const lowerQuery = query.toLowerCase();
    const results = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery) ||
        post.category.toLowerCase().includes(lowerQuery)
    );

    onSearchResults(results);
    return results;
  }, [query, posts, onSearchResults]);

  return (
    <div className="relative max-w-md mx-auto mb-6">
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-200 ${
          isFocused
            ? "bg-white shadow-lg ring-2 ring-orange-200"
            : "bg-white/70 shadow-sm hover:bg-white/80"
        }`}
      >
        <svg
          className="w-5 h-5 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="搜索文案..."
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {query && (
        <div className="absolute top-full left-0 right-0 mt-2 text-center">
          <span className="text-xs text-gray-500 bg-white/80 px-3 py-1 rounded-full">
            找到 {searchResults.length} 条相关内容
          </span>
        </div>
      )}
    </div>
  );
}
