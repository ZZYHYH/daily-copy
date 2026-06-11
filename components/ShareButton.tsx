"use client";

import { useState } from "react";

interface ShareButtonProps {
  title: string;
  content: string;
  imageUrl?: string;
}

export default function ShareButton({ title, content, imageUrl }: ShareButtonProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareText = `${title}\n\n${content}`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = async (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    switch (platform) {
      case "wechat":
        // 复制内容到剪贴板，提示用户粘贴到微信
        try {
          await navigator.clipboard.writeText(shareText);
          alert("内容已复制，请打开微信粘贴分享");
        } catch {
          alert("复制失败，请手动复制");
        }
        break;
      case "weibo":
        window.open(`https://service.weibo.com/share/share.php?title=${encodedText}&url=${encodedUrl}`);
        break;
      case "qq":
        window.open(`https://connect.qq.com/widget/shareqq/index.html?title=${encodeURIComponent(title)}&summary=${encodedText}&url=${encodedUrl}`);
        break;
      case "copy":
        try {
          await navigator.clipboard.writeText(shareText);
          alert("已复制到剪贴板");
        } catch {
          alert("复制失败");
        }
        break;
    }
    setShowShareMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowShareMenu(!showShareMenu);
        }}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        分享
      </button>

      {showShareMenu && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 p-2 min-w-[120px] z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleShare("wechat")}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
          >
            <span className="text-green-500">📱</span>
            微信
          </button>
          <button
            onClick={() => handleShare("weibo")}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <span className="text-red-500">📝</span>
            微博
          </button>
          <button
            onClick={() => handleShare("copy")}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="text-gray-500">📋</span>
            复制
          </button>
        </div>
      )}
    </div>
  );
}
