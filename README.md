<p align="center">
  <h1 align="center">凌's Blog</h1>
  <p align="center">
    一个关于技术、自托管和工具的静态博客。<br/>
    用 MDX 写作，以纯 HTML 交付。无广告，无追踪，无服务端。
  </p>
</p>

<p align="center">
  <a href="https://blog.ybysn.org"><strong>blog.ybysn.org</strong></a>
</p>

---

## 为什么要有这个博客

市面上不缺博客框架。但大多数要么太重（动态 CMS + 数据库），要么太轻（缺少搜索、大纲、评论这些读者真正需要的功能），要么在两者之间做了奇怪的取舍。

这个博客的目标很简单——**写 Markdown，生成静态 HTML，但阅读体验不妥协**。它是我自己的技术笔记，也是我打磨前端工程实践的地方。

如果你也想搭一个类似的博客，这个仓库可以直接 fork。改几个常量，删掉我的文章，就是你的。

## 一眼看完

```text
content/posts/xxx.mdx   ──→   静态 HTML 页面
     (你只写这个)              (读者看到这个)
```

中间发生了什么：

| 环节 | 做了什么 |
|------|----------|
| MDX 编译 | GFM 表格、代码高亮（Shiki 双主题）、标题自动生成 id 锚点 |
| 数据层 | 构建时扫描 `content/posts/`，提取 frontmatter，建立分类/标签/搜索索引 |
| 页面生成 | 所有路由静态预渲染（`generateStaticParams`），零客户端请求 |
| 客户端增强 | 搜索（Fuse.js）、评论（Giscus）、大纲导航、主题/语言切换 |

## 功能

### 写给读者

- **全文搜索** — 搜标题、描述、标签（Fuse.js，客户端实时过滤，不需要后端）
- **分类浏览** — 4 个分类：网络与代理、服务器与基础设施、开发工具、Windows 技巧
- **文章大纲** — 桌面端右侧 sticky 侧边栏，自动跟踪当前章节（IntersectionObserver）
- **深色模式** — 手动切换或跟随系统，页面加载前注入防闪烁脚本
- **中英双语** — 所有 UI 文案均可切换，语言偏好持久化
- **RSS 订阅** — `/feed.xml`，构建时自动生成
- **评论** — Giscus（GitHub Discussions），自动跟随主题和语言

### 写给作者

- **MDX 写作** — 标准 Markdown + 嵌入 JSX 组件，`.mdx` 文件即文章
- **阅读时间** — 自动估算，中英文混合计算（中文 400 字/分，英文 200 词/分）
- **发布控制** — `published: false` 即隐藏，草稿和工作区可以共存
- **Open Graph** — 每篇文章独立的 OG 元数据，社交分享友好
- **一行命令发布** — `npm run build`，推到 GitHub，Pages 自动部署

### 写给开发者

- **完全静态** — `output: 'export'`，产物是纯 HTML/CSS/JS，Nginx 一行配置搞定
- **server → client 分離** — 每个页面拆 `page.tsx`（服务端读取数据）+ `*-content.tsx`（客户端交互），职责清晰
- **CSS 变量主题** — VitePress 色板，一套变量同时控制浅色/深色，Tailwind 完全可覆盖
- **GSAP 动画** — 入场动画通过 `gsap.matchMedia()` 响应 `prefers-reduced-motion`
- **两个 MDX 通道** — `@next/mdx` webpack loader 和 `@mdx-js/mdx` runtime evaluate 共用同一套组件和插件

## 快速开始

```bash
git clone git@github.com:ybysn/blogwebsite.git
cd blogwebsite
npm install
npm run dev          # http://localhost:3000
```

### 改成你自己的博客

1. **`lib/constants.ts`** — 改站名、域名、作者名、社交链接
2. **`lib/constants.ts`** — 改 Giscus 配置（去 [giscus.app](https://giscus.app) 生成你自己的）
3. **`app/globals.css`** — （可选）换主题色，修改 CSS 变量
4. **`lib/categories.ts`** — 改成你的分类
5. **删掉 `content/posts/` 里我的文章**，开始写你的
6. **`public/` 里的 icon** — 换成你自己的 favicon

### 写一篇文章

```bash
# 1. 创建文件（文件名 = URL slug）
touch content/posts/my-first-post.mdx

# 2. 写 frontmatter + 内容
```

```yaml
---
title: "我的第一篇文章"
date: "2026-06-01"
description: "这篇文章讲了什么（会出现在 SEO 和列表卡片里）"
tags: ["教程", "前端"]
published: true
category: "dev-tools"
lang: zh-CN
---
```

然后写 Markdown。支持 GFM 表格、代码块（Shiki 高亮）、`:::center` 容器等等。

`published: false` 的文章不会出现在列表里，但 URL 仍然可访问——可以当草稿用。

### 有效分类 ID

| ID | 名称 |
|----|------|
| `network-proxy` | 网络与代理 |
| `server-infra` | 服务器与基础设施 |
| `dev-tools` | 开发工具 |
| `windows` | Windows 技巧 |

在 `lib/categories.ts` 里可以增删改。

## 命令

```bash
npm run dev       # 开发服务器（热更新）
npm run build     # 生产构建 → out/（prebuild 自动生成 RSS）
npm run start     # 本地预览生产构建
npm run lint      # ESLint
```

## 项目结构

```
blogwebsite/
├── app/                            # Next.js App Router（页面）
│   ├── layout.tsx                   # 根布局（metadata、主题/语言初始化脚本）
│   ├── globals.css                  # 全局样式 + CSS 变量主题 + Tailwind
│   ├── page.tsx                     # 首页 (server)
│   ├── home-content.tsx             # 首页 (client: GSAP hero 动画)
│   ├── posts/
│   │   ├── page.tsx                 # 按分类展示文章 (server)
│   │   ├── [slug]/page.tsx          # 文章详情 + 大纲 (server: MDX 渲染在这里)
│   │   └── category/[category]/     # 单个分类的文章列表
│   ├── search/page.tsx              # 搜索页 (server 构建索引 → client Fuse.js)
│   └── about/page.tsx               # 关于页
│
├── components/
│   ├── home/                        # Hero 区、文章列表区、Section 标题
│   ├── layout/                      # Header、Footer、ThemeProvider、LanguageProvider
│   ├── posts/                       # MDX 渲染、搜索输入框、Giscus、文章导航、TOC 大纲
│   └── ui/                          # 原子组件：TagBadge、DarkToggle、LanguageToggle
│
├── content/posts/                   # ★ 你唯一需要日常碰的目录 —— MDX 文章
│
├── lib/
│   ├── posts.ts                     # 扫描 content/ → 解析 frontmatter → 建立缓存
│   ├── categories.ts                # 分类定义 + 按分类查询
│   ├── headings.ts                  # MDX 标题提取 → TocEntry[]（github-slugger）
│   ├── i18n.ts                      # 翻译字典 + t(locale, key, params?)
│   ├── search.ts                    # 搜索文档构建（标题 + 描述 + 标签）
│   ├── constants.ts                 # 站点名、URL、Giscus、社交链接
│   └── utils.ts                     # formatDate、estimateReadingTime（中英混合）
│
├── types/index.ts                   # PostFrontmatter、PostMeta、Post、TocEntry…
├── mdx-components.tsx               # MDX 自定义组件（h1-h4、a、pre、table、blockquote…）
├── scripts/generate-rss.mjs         # RSS feed.xml 生成（npm run prebuild 触发）
├── next.config.ts                   # MDX 插件链 + output: 'export'
└── package.json
```

## 设计决策

### 为什么是静态导出而不是 SSR

因为部署一个静态站点比维护一个 Node.js 服务简单一个数量级。Nginx 一行配置，GitHub Pages 免费，Cloudflare Pages 全球 CDN。没有服务器要管，没有数据库要备份，没有运行时漏洞要修补。

代价是每次发布要全量构建。对于一个个人博客（几十篇文章），构建时间不到 10 秒，完全可以接受。

### 为什么 MDX 跑了两套编译

`@next/mdx`（webpack loader）处理构建时的静态导入，`@mdx-js/mdx evaluate` 处理从文件系统动态读取的文章内容。两套路径共用同一份 `mdx-components.tsx` 和同一套插件配置（remark-gfm、rehype-slug、rehype-pretty-code）。

### 为什么搜索是客户端

11 篇文章，所有标题 + 描述 + 标签加起来不到 50KB。Fuse.js 在浏览器里跑比任何服务端方案都快——零网络延迟，按一个键立刻出结果。

### 为什么不直接用 Tailwind Typography

用了，但全面 override 了它的 CSS 变量。因为默认的 prose 样式在深色模式下表现不好，而且和 VitePress 色板的设计语言不一致。

## 技术栈

| 层 | 选择 |
|----|------|
| 框架 | Next.js 16 (App Router, Turbopack) |
| 内容 | MDX v3 (remark-gfm, rehype-slug, rehype-pretty-code + Shiki) |
| 样式 | Tailwind CSS 4 + CSS 自定义属性（VitePress 色板） |
| 搜索 | Fuse.js v7 |
| 评论 | Giscus（`@giscus/react`） |
| 动画 | GSAP + ScrollTrigger（`@gsap/react`） |
| 日期 | date-fns |
| RSS | feed |
| 代码高亮 | Shiki (github-light / github-dark-dimmed) |
| 部署 | 静态导出，部署到 Nginx / GitHub Pages / Cloudflare Pages |

## 部署

构建产物在 `out/`，推到任何静态托管即可。

**Nginx：**

```nginx
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

**GitHub Pages / Cloudflare Pages / Vercel / Netlify** — 直接指到 `out/` 目录或配置构建命令 `npm run build`，输出目录 `out`。

## 许可

MIT — 随便 fork，随便改，随便用。
