"use client";

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { name: "全部", icon: "🌈" },
  { name: "励志", icon: "💪" },
  { name: "情感", icon: "💗" },
  { name: "早安", icon: "🌅" },
  { name: "晚安", icon: "🌙" },
  { name: "日常", icon: "🍃" },
];

export default function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  return (
    <nav className="flex flex-wrap gap-3 justify-center">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => onCategoryChange(cat.name)}
          className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            activeCategory === cat.name
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-200 scale-105"
              : "glass-card text-gray-600 hover:bg-white/80 hover:shadow-md"
          }`}
        >
          <span className="text-base">{cat.icon}</span>
          {cat.name}
        </button>
      ))}
    </nav>
  );
}
