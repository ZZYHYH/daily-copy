# 每日文案 - 部署指南

## 第一步：注册账号

### 1. Vercel（托管网站）
1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"（用 GitHub 账号登录）
4. 完成注册

### 2. DeepSeek（AI 文案生成）
1. 访问 https://platform.deepseek.com
2. 点击 "注册"
3. 用手机号注册
4. 登录后，在 "API Keys" 页面创建一个新 Key
5. 复制保存这个 Key

### 3. Pixabay（免费图库）
1. 访问 https://pixabay.com/api/docs/
2. 点击 "Register" 注册账号
3. 注册后，在页面上找到你的 API Key
4. 复制保存这个 Key

## 第二步：上传代码到 GitHub

1. 访问 https://github.com/new
2. 创建一个新仓库，名称填 `daily-copy`
3. 不要勾选任何初始化选项
4. 点击 "Create repository"

然后在终端执行（把 YOUR_GITHUB_USERNAME 换成你的 GitHub 用户名）：

```bash
cd /Users/Zhuanz/Desktop/daily-copy
git init
git add .
git commit -m "初始化每日文案网站"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/daily-copy.git
git push -u origin main
```

## 第三步：部署到 Vercel

1. 访问 https://vercel.com/new
2. 选择你的 GitHub 仓库 `daily-copy`
3. 点击 "Import"
4. 在 "Environment Variables" 部分添加：
   - `DEEPSEEK_API_KEY` = 你刚才复制的 DeepSeek Key
   - `PIXABAY_API_KEY` = 你刚才复制的 Pixabay Key
5. 点击 "Deploy"

## 第四步：配置数据库

1. 部署完成后，在 Vercel Dashboard 找到你的项目
2. 点击 "Storage" 标签
3. 点击 "Create Database"
4. 选择 "KV" 类型
5. 选择免费区域
6. 点击 "Create"
7. 点击 "Connect to Project"
8. 选择你的 `daily-copy` 项目
9. 点击 "Connect"

## 第五步：验证

1. 等待部署完成（约 2-3 分钟）
2. 访问你的网站（Vercel 会给你一个 URL，类似 `daily-copy-xxx.vercel.app`）
3. 第一次访问可能没有内容（因为还没到凌晨自动生成）
4. 可以手动触发一次生成：
   - 在浏览器访问：`https://你的网站URL/api/cron/generate`
   - 输入你设置的 CRON_SECRET（如果有的话）
5. 刷新首页，应该能看到今天生成的内容了

## 常见问题

### Q: 网站显示 "暂无内容"？
A: 正常的，内容会在每天凌晨 0:00 自动生成。你可以手动访问 `/api/cron/generate` 来触发一次生成。

### Q: 图片加载不出来？
A: 检查 Pixabay API Key 是否正确配置。

### Q: 文案没有生成？
A: 检查 DeepSeek API Key 是否正确配置，以及账户余额是否充足。

### Q: 如何修改生成的分类？
A: 编辑 `lib/deepseek.ts` 文件中的 `CATEGORIES` 数组。

### Q: 如何修改每天生成的数量？
A: 编辑 `app/api/cron/generate/route.ts` 文件中的 `categoriesToGenerate` 逻辑。

## 费用说明

- **Vercel**: 免费（个人项目足够）
- **DeepSeek**: 注册送 500 万 token，每天生成 3 条文案约消耗 2000 token，可用 **6 年+**
- **Pixabay**: 免费（每月 5000 次 API 调用）
- **总计**: 约 ¥0.3/月
