"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";
import DownloadButton from "./DownloadButton";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
  image_author: string;
  date: string;
}

export default function PostCard({
  title,
  content,
  category,
  image_url,
  image_author,
  date,
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryColors: Record<string, string> = {
    励志: "bg-orange-500",
    情感: "bg-pink-500",
    早安: "bg-yellow-500",
    晚安: "bg-indigo-500",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative aspect-square">
        <img
          src={image_url}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <span
            className={`${categoryColors[category] || "bg-gray-500"} text-xs px-2 py-1 rounded-full`}
          >
            {category}
          </span>
          <h3 className="text-xl font-bold mt-2 line-clamp-2">{title}</h3>
        </div>
      </div>

      <div className="p-4">
        <p
          className={`text-gray-600 text-sm leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}
        >
          {content}
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 text-sm mt-2 hover:text-blue-600"
        >
          {isExpanded ? "收起" : "展开全文"}
        </button>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-xs text-gray-400">
            <span>{date}</span>
            <span className="mx-2">|</span>
            <span>图源: {image_author}</span>
          </div>
          <div className="flex gap-2">
            <CopyButton text={`${title}\n\n${content}`} />
            <DownloadButton imageUrl={image_url} title={title} />
          </div>
        </div>
      </div>
    </div>
  );
}
