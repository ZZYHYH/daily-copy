import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Link href="/" className="flex items-center justify-center gap-2">
          <span className="text-2xl">"</span>
          <h1 className="text-2xl font-bold text-gray-800">每日文案</h1>
          <span className="text-2xl">"</span>
        </Link>
        <p className="text-center text-gray-500 text-sm mt-1">
          每天更新 · 朋友圈配图素材
        </p>
      </div>
    </header>
  );
}
