<p align="center">
  <h1 align="center">凌's Blog</h1>
  <p align="center">
    A statically-generated, MDX-powered personal blog — built with Next.js,<br/>
    delivered as pure HTML. No ads, no tracking, no backend.
  </p>
</p>

<p align="center">
  <a href="https://blog.ybysn.org"><strong>blog.ybysn.org</strong></a> &nbsp;·&nbsp;
  <a href="https://blog.ybysn.org/feed.xml">RSS</a> &nbsp;·&nbsp;
  <a href="https://github.com/ybysn/blogwebsite">GitHub</a>
</p>

---

## Overview

This is the source for my personal technical blog. The site covers networking, server administration, developer tooling, and Windows internals — topics I work with daily. It also hosts a complete [Easy-Vibe](https://github.com/datawhalechina/easy-vibe) AI programming tutorial (182 pages), migrated from VitePress and served as a static course site under `/tutorial`.

The engineering philosophy is simple: **author in Markdown, ship static HTML, compromise nothing**. Every page is pre-rendered at build time. Search, table of contents, code highlighting, dark mode, i18n, and comments all work without a runtime server.

If you want a blog with the same architecture, this repository is designed to be forked. Change a handful of constants, delete my posts, and it's yours.

## Architecture

```text
content/posts/*.mdx   ──▶   Static HTML pages
content/tutorial/*.mdx ──▶   (readers see this)
     ↑                                ↑
  you author here            Next.js builds here
```

| Pipeline Stage | Implementation |
|:---------------|:---------------|
| **MDX Compilation** | GFM tables, Shiki dual-theme syntax highlighting, auto-generated heading anchor IDs |
| **Data Layer** | Build-time filesystem scan → frontmatter extraction → category/tag/search indexes |
| **Page Generation** | `generateStaticParams()` for all routes; zero client-side data fetching |
| **Client Enhancement** | Fuse.js search, Giscus comments, sticky TOC with scroll tracking, theme/locale toggles |

## Features

### Reading Experience

| Feature | Detail |
|:--------|:------|
| **Full-text search** | Client-side Fuse.js — searches titles, descriptions, and tags with weighted scoring. No backend required. |
| **Category navigation** | 4 curated categories with bilingual names and descriptions, each with a dedicated listing page. |
| **Table of contents** | Sticky right sidebar on desktop with `IntersectionObserver`-based active heading tracking. |
| **Dark mode** | Manual toggle or `prefers-color-scheme` auto-detection. Flash-free via inline `<script>` injected before hydration. |
| **Bilingual UI** | Full English / 简体中文 toggle for all interface text. Preference persisted in `localStorage`. |
| **RSS** | Auto-generated `feed.xml` at build time via `scripts/generate-rss.mjs`. |
| **Comments** | Giscus (GitHub Discussions backend). Automatically follows the active theme and language. |
| **Tutorial section** | 182-page Easy-Vibe course with collapsible sidebar navigation, prev/next pagination, and CC BY-NC-SA 4.0 attribution. |

### Authoring Experience

| Feature | Detail |
|:--------|:------|
| **MDX-first** | Standard Markdown with optional JSX component embedding. `.mdx` files in `content/posts/` are articles. |
| **Reading time** | Auto-estimated with mixed CJK/Latin awareness (400 chars/min for CJK, 200 words/min for Latin). |
| **Draft mode** | Set `published: false` in frontmatter to hide a post from listings while keeping it accessible by direct URL. |
| **Open Graph** | Per-post OG metadata (title, description, custom `ogImage`) for social sharing. |
| **Single-command deploy** | `npm run build` → `git push` → Cloudflare Pages auto-deploys. |

### Engineering

| Feature | Detail |
|:--------|:------|
| **Fully static** | `output: 'export'` in Next.js config. Output is pure HTML/CSS/JS — deployable to any static host with a single Nginx directive. |
| **Server/Client separation** | Every interactive page follows `page.tsx` (server, data fetching) + `*-content.tsx` (client, interactivity). |
| **CSS variable theming** | VitePress-inspired color palette. One set of custom properties drives both light and dark modes. Tailwind tokens are mapped to these variables. |
| **Motion** | GSAP + ScrollTrigger entrance animations with `gsap.matchMedia()` respecting `prefers-reduced-motion`. |
| **Dual MDX pipeline** | `@next/mdx` webpack loader (build-time imports) and `@mdx-js/mdx` `evaluate()` (runtime content) share the same component map and plugin chain. |
| **Tutorial build pipeline** | Custom `convert-tutorial.mjs` script transforms VitePress source into valid MDX — stripping Vue SFC blocks, converting admonitions, rewriting image paths, and escaping incompatible syntax. |

## Project Structure

```
blogwebsite/
├── app/                              # Next.js App Router
│   ├── layout.tsx                     # Root layout — metadata, theme/locale init scripts
│   ├── globals.css                    # Tailwind + CSS custom properties + prose overrides
│   ├── page.tsx / home-content.tsx    # Homepage (server → client split)
│   ├── posts/
│   │   ├── page.tsx                   # Category listing (server)
│   │   ├── [slug]/page.tsx            # Post detail — MDX rendering, TOC, comments (server)
│   │   └── category/[category]/       # Per-category post lists
│   ├── tutorial/
│   │   ├── page.tsx                   # Tutorial landing page (server)
│   │   └── [...slug]/page.tsx         # Tutorial content pages (server)
│   ├── search/                        # Search page
│   └── about/                         # About page
│
├── components/
│   ├── home/                          # Hero section, post list, section headers
│   ├── layout/                        # Header, Footer, ThemeProvider, LanguageProvider
│   ├── posts/                         # MDX runtime compiler, search input, Giscus, post nav, TOC
│   └── ui/                            # Atomic components: TagBadge, DarkToggle, LanguageToggle
│
├── content/
│   ├── posts/                         # ★ Blog posts (.mdx) — the only directory you touch daily
│   └── tutorial/                      # Easy-Vibe tutorial content (3 stages + appendix, 182 .mdx files)
│
├── lib/
│   ├── posts.ts                       # Filesystem scanner → frontmatter parser → post cache
│   ├── tutorial.ts                    # Tutorial scanner → navigation tree → prev/next computation
│   ├── categories.ts                  # Category definitions + grouping queries
│   ├── headings.ts                    # MDX heading extraction → TocEntry[] (github-slugger)
│   ├── i18n.ts                        # Translation dictionary + t() lookup
│   ├── search.ts                      # Build-time search document index
│   ├── constants.ts                   # Site name, URL, author, Giscus config, social links
│   └── utils.ts                       # formatDate, estimateReadingTime (CJK-aware)
│
├── types/index.ts                     # PostFrontmatter, PostMeta, Post, TocEntry, Tutorial*
├── mdx-components.tsx                  # Custom MDX components (h1–h4, a, pre, code, table, blockquote…)
├── scripts/
│   ├── generate-rss.mjs               # RSS feed generation (prebuild hook)
│   └── convert-tutorial.mjs           # VitePress → MDX migration script
├── next.config.ts                     # MDX plugin chain + output: 'export'
└── package.json
```

## Quick Start

```bash
git clone git@github.com:ybysn/blogwebsite.git
cd blogwebsite
npm install
npm run dev          # http://localhost:3000
```

### Making It Your Own

1. **`lib/constants.ts`** — Update site name, URL, author, and social links.
2. **`lib/constants.ts`** — Replace the Giscus configuration with your own from [giscus.app](https://giscus.app).
3. **`lib/categories.ts`** — Redefine the category list to match your content areas.
4. **`app/globals.css`** — (Optional) Override the CSS custom properties to change the color scheme.
5. **Replace `content/posts/`** — Remove my articles and add yours.
6. **Replace `public/` assets** — Update `favicon.ico` and any other static assets.
7. **Remove `content/tutorial/`** — Unless you want the Easy-Vibe course on your site.

### Writing a Post

```bash
# Create a file — the filename becomes the URL slug
touch content/posts/my-first-post.mdx
```

```yaml
---
title: "My First Post"
date: "2026-06-01"
description: "A short summary for SEO, RSS, and listing cards."
tags: ["tutorial", "frontend"]
published: true
category: "dev-tools"
lang: zh-CN
---
```

Write standard Markdown below the frontmatter. GFM tables, fenced code blocks with Shiki highlighting, and `:::center` containers are all supported.

Set `published: false` to hide a post from listings while keeping the URL accessible — useful for drafts.

### Categories

| ID | English | 中文 |
|:---|:--------|:-----|
| `network-proxy` | Network & Proxy | 网络与代理 |
| `server-infra` | Server & Infrastructure | 服务器与基础设施 |
| `dev-tools` | Dev Tools | 开发工具 |
| `windows` | Windows Tips | Windows 技巧 |

Categories are defined in `lib/categories.ts`. Add, remove, or rename them there.

## Commands

```bash
npm run dev       # Development server with HMR (Turbopack)
npm run build     # Production build → out/ (runs RSS prebuild script)
npm run start     # Serve the production build locally
npm run lint      # ESLint
```

## Design Decisions

### Static Export over SSR

Deploying static files is an order of magnitude simpler than maintaining a Node.js runtime. A single Nginx `location` block, a free GitHub Pages repo, or a Cloudflare Pages project with global CDN — no server to patch, no database to back up, no runtime to monitor.

The trade-off is a full rebuild on every publish. For a personal blog with tens of posts, build time is under 10 seconds — well within acceptable bounds.

### Dual MDX Pipeline

`@next/mdx` (webpack loader) handles statically imported `.mdx` pages at build time. `@mdx-js/mdx` `evaluate()` compiles posts and tutorials read dynamically from the filesystem at request time (still at build time in the static export model — the "request" is the static generation pass). Both paths use the same component map (`mdx-components.tsx`) and the same plugin stack (`remark-gfm`, `rehype-slug`, `rehype-pretty-code`).

### Client-Side Search

With ~10 posts, the entire search corpus (titles, descriptions, tags) weighs under 50 KB. Fuse.js running in the browser outperforms any server-side solution — zero network latency, instant keystroke-by-keystroke results. For larger content sets, this could be swapped for a pre-built static index or a lightweight search backend.

### CSS Variables over Tailwind-Only Theming

Tailwind Typography (`@tailwindcss/typography`) is used but its default CSS variables are fully overridden. The VitePress-derived color palette operates through custom properties on `:root` and `.dark`, giving precise control over both modes while keeping the utility-class workflow for component styling.

## Tech Stack

| Layer | Choice |
|:------|:-------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Content | MDX v3 (remark-gfm, rehype-slug, rehype-pretty-code) |
| Syntax Highlighting | Shiki (`github-light` / `github-dark-dimmed`) |
| Styling | Tailwind CSS 4 + CSS custom properties (VitePress palette) |
| Search | Fuse.js v7 (client-side, weighted fuzzy matching) |
| Comments | Giscus (`@giscus/react`) |
| Animation | GSAP + ScrollTrigger (`@gsap/react`) |
| Date Handling | date-fns |
| RSS | feed |
| Package Manager | npm |

## Deployment

Build output lands in `out/`. Deploy to any static file host.

**Nginx**

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

**Cloudflare Pages / GitHub Pages / Vercel / Netlify**

| Setting | Value |
|:--------|:------|
| Build command | `npm run build` |
| Output directory | `out` |
| Node version | ≥ 20 |

## License

MIT — fork freely, modify freely, use freely.
