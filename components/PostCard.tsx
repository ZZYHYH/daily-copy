"use client";

import { useState } from "react";
import CopyButton from "./CopyButton";
import DownloadButton from "./DownloadButton";
import ShareButton from "./ShareButton";

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
  const [showFull, setShowFull] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const categoryColors: Record<string, string> = {
    励志: "from-amber-400 to-orange-500",
    情感: "from-pink-400 to-rose-500",
    早安: "from-yellow-400 to-amber-500",
    晚安: "from-indigo-400 to-purple-500",
    日常: "from-green-400 to-emerald-500",
  };

  const categoryEmoji: Record<string, string> = {
    励志: "💪",
    情感: "💗",
    早安: "🌅",
    晚安: "🌙",
    日常: "🍃",
  };

  return (
    <>
      <div
        className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-in-up group"
        onClick={() => setShowFull(true)}
      >
        {image_url && (
          <div className="relative overflow-hidden aspect-[4/3]">
            {/* 图片加载占位符 */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
            )}
            <img
              src={image_url}
              alt={title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3">
              <span className={`bg-gradient-to-r ${categoryColors[category] || "from-gray-400 to-gray-500"} text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg`}>
                {categoryEmoji[category]} {category}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="text-lg font-bold line-clamp-2 drop-shadow-lg">{title}</h3>
            </div>
          </div>
        )}

        <div className="p-4">
          <p className={`text-gray-600 text-sm leading-relaxed ${isExpanded ? "" : "line-clamp-3"}`}>
            {content}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="text-orange-500 text-sm mt-2 hover:text-orange-600 font-medium"
          >
            {isExpanded ? "收起 ▲" : "展开全文 ▼"}
          </button>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{date}</span>
            <div className="flex gap-2">
              <ShareButton title={title} content={content} imageUrl={image_url} />
              <CopyButton text={`${title}\n\n${content}`} />
              <DownloadButton imageUrl={image_url} title={title} />
            </div>
          </div>
        </div>
      </div>

      {/* 全屏预览弹窗 */}
      {showFull && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowFull(false)}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {image_url && (
              <img src={image_url} alt={title} className="w-full object-cover rounded-t-3xl" loading="lazy" />
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`bg-gradient-to-r ${categoryColors[category]} text-white text-xs px-3 py-1 rounded-full`}>
                  {categoryEmoji[category]} {category}
                </span>
                <span className="text-xs text-gray-400">{date}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">{title}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{content}</p>
              <div className="flex gap-3 mt-6">
                <ShareButton title={title} content={content} imageUrl={image_url} />
                <CopyButton text={`${title}\n\n${content}`} />
                <DownloadButton imageUrl={image_url} title={title} />
                <button
                  onClick={() => setShowFull(false)}
                  className="px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
