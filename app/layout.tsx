import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "每日文案 - 朋友圈配图素材 | 每天更新励志情感文案",
  description: "每天更新的朋友圈文案配图素材，涵盖励志、情感、早安、晚安、日常五大类别。一键复制下载，让你的朋友圈更有质感。",
  keywords: ["朋友圈文案", "文案配图", "励志文案", "情感文案", "早安文案", "晚安文案", "每日文案", "朋友圈素材"],
  authors: [{ name: "每日文案" }],
  creator: "每日文案",
  publisher: "每日文案",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://daily-copy.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "每日文案 - 朋友圈配图素材",
    description: "每天更新的朋友圈文案配图素材，涵盖励志、情感、早安、晚安、日常五大类别。",
    url: "https://daily-copy.vercel.app",
    siteName: "每日文案",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "每日文案 - 朋友圈配图素材",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "每日文案 - 朋友圈配图素材",
    description: "每天更新的朋友圈文案配图素材，涵盖励志、情感、早安、晚安、日常五大类别。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // 如果需要百度/谷歌站长验证，取消注释并填入验证码
    // google: "your-google-verification-code",
    // baidu: "your-baidu-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "每日文案",
              url: "https://daily-copy.vercel.app",
              description: "每天更新的朋友圈文案配图素材",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://daily-copy.vercel.app/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* 预连接关键资源 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
