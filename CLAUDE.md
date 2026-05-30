# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build → out/ (runs prebuild RSS script first)
npm run start        # Serve production build
npm run lint         # ESLint
```

## Architecture

**Static export** — `next.config.ts` sets `output: 'export'` with `images.unoptimized: true`. The entire site builds to static HTML in `out/`. No API routes, no database, no server-side data fetching. All content is read from the filesystem at build time.

**Page extensions** — Next.js treats `.md` and `.mdx` files as pages (`pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx']`).

## Content: MDX Blog Posts

Posts live in `content/posts/` as `.mdx` files with YAML frontmatter:

```yaml
---
title: "Post Title"           # required
date: "2026-05-30"            # required, ISO format
description: "Description"    # required
tags: ["tag1", "tag2"]        # required, string array
published: true               # required — false hides the post
lang: zh-CN                   # optional, 'en' (default) or 'zh-CN'
ogImage: "https://..."        # optional, Open Graph image
---
```

**Adding a new post** — create a `.mdx` file in `content/posts/`, set `published: true`, and rebuild. `lib/posts.ts` scans the directory at build time; posts with `published: false` are excluded from listings but still reachable by direct slug.

**MDX rendering** happens in two paths:
1. `@next/mdx` webpack loader (configured in `next.config.ts`) — for imported MDX
2. Runtime evaluation (`components/posts/mdx-remote.tsx`) — dynamically compiles MDX source with `@mdx-js/mdx` evaluate, used in `mdx-content.tsx`

Both paths share `mdx-components.tsx` for rendering, and both use the same remark/rehype plugins: `remark-gfm`, `rehype-slug`, `rehype-pretty-code` (Shiki with `github-light`/`github-dark-dimmed` themes).

### Reading time

`lib/utils.ts` has `estimateReadingTime(text)` which handles mixed CJK/Latin text (CJK: 400 chars/min, Latin: 200 words/min). The `reading-time` package in `package.json` is unused — the custom implementation is the real one.

### RSS

`scripts/generate-rss.mjs` runs as `prebuild` and writes `public/feed.xml`. Uses `gray-matter` to parse frontmatter and the `feed` package to generate RSS 2.0.

## Component Pattern: Server → Client Content Split

Every page follows the same pattern: a **server component** (`page.tsx`) reads data at build time and passes it as props to a **client component** (`*-content.tsx`) that handles interactivity (GSAP animations, search, theme/language context).

```
app/
  page.tsx              # Server: getAllPosts() → HomeContent
  home-content.tsx      # Client: GSAP hero + post list animations
  about/page.tsx        # Server
  about-content.tsx     # Client
  search/page.tsx       # Server: getSearchDocuments() → SearchContent
  search-content.tsx    # Client: Fuse.js search UI
  tags/page.tsx         # Server: getAllTags() → TagsContent
  tags-content.tsx      # Client
  tags/[tag]/page.tsx   # Server: getPostsByTag(tag) + generateStaticParams
  tag-content.tsx       # Client
  posts/[slug]/page.tsx # Server: getPostBySlug(slug) + generateStaticParams + generateMetadata
```

The post detail page (`posts/[slug]/page.tsx`) is the exception — it's a server component that handles most rendering inline (metadata, MDX content, post nav, Giscus) since the MDX rendering itself must be server-side.

## Theming & i18n

Both are client-side React Context providers in `components/layout/`:

- **ThemeProvider** — toggles `.dark` class on `<html>`, persists to localStorage. An inline `<script>` in `app/layout.tsx` reads localStorage before React hydrates to prevent flash.
- **LanguageProvider** — manages `'en'`/`'zh-CN'` locale, exposes `t(key, params?)` for translation lookups. All translation strings are in `lib/i18n.ts`.

CSS variables define the actual theme values (in `app/globals.css`): `:root` for light, `.dark` for dark. Tailwind CSS 4 uses `@theme inline` to map these CSS variables into Tailwind design tokens.

## Styling

Tailwind CSS 4 via `@tailwindcss/postcss`, with `@tailwindcss/typography` as a plugin. Most styles live in `app/globals.css` using Tailwind utilities and CSS variables. Components occasionally use inline `style={}` props for dynamic values referencing CSS variables. The custom dark mode variant is `&:where(.dark, .dark *)` (not `prefers-color-scheme`).

## GSAP Animations

Three components use GSAP + ScrollTrigger: `hero-section.tsx` (fade-in sequence), `section-header.tsx` (scroll-triggered slide/fade), and `post-list-section.tsx` (scroll-triggered staggered cards). All use `gsap.matchMedia()` with `prefers-reduced-motion: no-preference` and proper cleanup via `useGSAP` from `@gsap/react`.

## Search

Client-side Fuse.js v7 in `components/posts/search-input.tsx`. Search documents are pre-built at build time by `lib/search.ts` (title, description, tags only — no full content). Weighted search: title ×2, description ×1.5, tags ×1. Threshold: 0.4.

## Giscus Comments

Configured in `lib/constants.ts` (`GISCUS_CONFIG`). Rendered by `components/posts/giscus.tsx` which subscribes to theme and language contexts. Appears at the bottom of every post page.

## Dynamic Routes with Static Generation

Both `posts/[slug]/page.tsx` and `tags/[tag]/page.tsx` export `generateStaticParams()` to pre-build all possible paths. Slugs are read from the filesystem; tag slugs use `encodeURIComponent`.
