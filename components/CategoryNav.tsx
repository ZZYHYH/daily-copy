"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const categories = [
  { name: "全部", slug: "" },
  { name: "励志", slug: "励志" },
  { name: "情感", slug: "情感" },
  { name: "早安", slug: "早安" },
  { name: "晚安", slug: "晚安" },
];

export default function CategoryNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 justify-center">
      {categories.map((category) => {
        const isActive = category.slug
          ? pathname === `/category/${category.slug}`
          : pathname === "/";

        return (
          <Link
            key={category.slug}
            href={category.slug ? `/category/${category.slug}` : "/"}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
