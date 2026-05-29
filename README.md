# 每日文案 - 朋友圈配图素材网站

每天自动生成励志、情感文案配图，一键复制下载发朋友圈。

## 功能特性

- 每天凌晨自动生成 3 条文案（励志/情感/早安）
- AI 生成走心文案 + Pixabay 高清摄影配图
- Canvas 文字叠加，生成 1080x1080 朋友圈最佳尺寸
- 一键复制文案
- 一键下载配图
- 按分类浏览

## 技术栈

- **前端**: Next.js 14 + Tailwind CSS
- **AI**: DeepSeek API（中国AI）
- **图库**: Pixabay API（免费）
- **存储**: Vercel KV（Redis）
- **部署**: Vercel

## 部署步骤

### 1. 注册账号

- **Vercel**: https://vercel.com（GitHub 一键登录）
- **DeepSeek**: https://platform.deepseek.com（手机号注册）
- **Pixabay**: https://pixabay.com/api/docs（邮箱注册）

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，填入 API Key：

```
DEEPSEEK_API_KEY=your_key
PIXABAY_API_KEY=your_key
```

### 3. 部署到 Vercel

1. 将代码推到 GitHub
2. 在 Vercel 导入 GitHub 仓库
3. 在 Vercel Dashboard 创建 KV 数据库
4. 填入环境变量
5. 部署完成

### 4. 自动运行

Vercel Cron 会在每天凌晨 0:00 自动生成新内容。

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
daily-copy/
├── app/                    # Next.js 页面
│   ├── api/               # API 路由
│   ├── category/          # 分类页面
│   └── page.tsx           # 首页
├── components/            # React 组件
├── lib/                   # 工具函数
│   ├── deepseek.ts        # AI 文案生成
│   ├── pixabay.ts         # 图片搜索
│   ├── kv.ts              # 数据存储
│   └── image-generator.ts # 图片处理
└── vercel.json            # Vercel 配置
```
