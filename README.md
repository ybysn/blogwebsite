# 凌's Blog

一个基于 Next.js 16 的**完全静态**个人技术博客。支持中英双语、深色模式、全文搜索、MDX 文章、Giscus 评论、RSS 订阅和大纲导航。

**在线地址:** [blog.ybysn.org](https://blog.ybysn.org)

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS 4 + CSS 变量主题 |
| 内容 | MDX (remark-gfm + rehype-slug + rehype-pretty-code) |
| 搜索 | Fuse.js v7 (客户端全文搜索) |
| 评论 | Giscus (GitHub Discussions) |
| 动画 | GSAP + ScrollTrigger |
| 部署 | 静态导出 → Nginx / 任意静态托管 |

## 功能特性

- 🌐 **中英双语** — 客户端语言切换，通过 React Context + localStorage 持久化
- 🌓 **深色/浅色模式** — 支持跟随系统偏好，页面加载前注入防闪烁脚本
- ✍️ **MDX 博客** — 支持 Markdown + JSX，Shiki 代码高亮（双主题），阅读时间估算
- 📂 **分类系统** — 4 个预定义分类：网络代理、服务器基础设施、开发工具、Windows 技巧
- 🏷️ **标签系统** — 每篇文章支持多标签，标签徽章展示
- 🔍 **全文搜索** — Fuse.js 客户端搜索，权重分配（标题 ×2、描述 ×1.5、标签 ×1）
- 📋 **文章大纲** — 桌面端右侧 sticky 侧边栏，IntersectionObserver 跟踪当前章节
- 💬 **Giscus 评论** — 基于 GitHub Discussions，自动跟随主题和语言
- 📡 **RSS 订阅** — 构建时自动生成 `feed.xml`
- 🎬 **GSAP 入场动画** — 首页 Hero 区域文字逐条淡入，响应 `prefers-reduced-motion`
- 🏗️ **完全静态导出** — 无服务端，可部署到任意静态托管

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:3000）
npm run dev

# 生产构建（输出到 out/ 目录）
npm run build

# 本地预览生产构建
npm run start
```

## 项目结构

```
blogwebsite/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx             # 首页（服务端）
│   ├── home-content.tsx     # 首页（客户端：GSAP 动画）
│   ├── posts/
│   │   ├── page.tsx         # 文章列表（按分类）
│   │   ├── posts-content.tsx
│   │   ├── [slug]/page.tsx  # 文章详情 + TOC 大纲
│   │   └── category/[category]/page.tsx  # 分类页面
│   ├── search/page.tsx      # 搜索页面
│   ├── about/page.tsx       # 关于页面
│   └── globals.css          # 全局样式 + CSS 变量主题
├── components/
│   ├── home/                # 首页组件 (Hero, PostList, SectionHeader)
│   ├── layout/              # 布局 (Header, Footer, ThemeProvider, LanguageProvider)
│   ├── posts/               # 文章组件 (MDXContent, SearchInput, Giscus, TOC…)
│   └── ui/                  # UI 原子组件 (TagBadge, DarkToggle, LanguageToggle)
├── content/posts/           # MDX 博客文章（.mdx 文件）
├── lib/
│   ├── posts.ts             # 文章数据读写 + 缓存
│   ├── categories.ts        # 分类定义 + 查询
│   ├── headings.ts          # MDX 标题提取（用于 TOC）
│   ├── i18n.ts              # 翻译字典 + t() 函数
│   ├── search.ts            # 搜索文档构建
│   ├── constants.ts         # 站点配置常量
│   └── utils.ts             # 工具函数（日期格式化、阅读时间估算）
├── types/index.ts           # TypeScript 类型定义
├── scripts/generate-rss.mjs # RSS 生成脚本（prebuild）
├── mdx-components.tsx       # MDX 组件映射（自定义 h1-h4、a、pre、table 等）
└── next.config.ts           # Next.js 配置（MDX 插件、静态导出）
```

## 添加文章

在 `content/posts/` 下创建 `.mdx` 文件，包含以下 frontmatter：

```yaml
---
title: "文章标题"
date: "2026-05-31"
description: "文章描述（用于 SEO 和列表预览）"
tags: ["标签1", "标签2"]
published: true           # false 则隐藏
category: "dev-tools"     # 必须属于 lib/categories.ts 中定义的 ID
lang: zh-CN                # 可选，en（默认）或 zh-CN
ogImage: "https://..."    # 可选，Open Graph 社交图片
---
```

文件名为 `slug.mdx`，即 URL 中的文章路径。例如 `vps-setup-guide.mdx` → `/posts/vps-setup-guide`。

## 配置

编辑 `lib/constants.ts` 修改站点信息：

```typescript
export const SITE_URL = 'https://your-domain.com'
export const SITE_NAME = "Your Blog Name"
export const AUTHOR = 'Your Name'
export const SOCIAL_LINKS = { github: '...', twitter: '...' }
export const GISCUS_CONFIG = { repo: '...', repoId: '...', category: '...', categoryId: '...' }
```

## 部署

本项目使用静态导出（`output: 'export'`），构建产物在 `out/` 目录。可部署到任何静态文件服务：

```bash
# Nginx 示例
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/blog/out;
    index index.html;
    location / {
        try_files $uri $uri.html $uri/ =404;
    }
}
```

也支持直接部署到 Cloudflare Pages、Vercel、Netlify 等平台。

## 许可

MIT
