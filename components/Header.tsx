import Link from "next/link";

export default function Header() {
  const today = new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" });

  return (
    <header className="glass-card border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <Link href="/" className="flex items-center justify-center gap-3">
          <span className="text-3xl">✨</span>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 bg-clip-text text-transparent">
            每日文案
          </h1>
          <span className="text-3xl">✨</span>
        </Link>
        <p className="text-center text-gray-500 text-sm mt-1">
          {today} · 每天更新 · 朋友圈配图素材
        </p>
      </div>
    </header>
  );
}
