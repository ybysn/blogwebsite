# 日报汇总

所有日报统一记录在此文件中，按日期倒序排列。

---

## 2026-06-03 (周三) — 下午

### 5. 修复 console error：layout.tsx 中 script 标签警告

**问题：** React 19 不允许在组件内渲染 `<script dangerouslySetInnerHTML>` —— "Scripts inside React components are never executed"。

**修复：** 移除 `<head>` 包装器，改用 Next.js `<Script strategy="beforeInteractive">` 内联写入。两个初始化脚本（theme、locale）行为不变。

### 6. 修复 hydration 不匹配

**问题：** 之前将 `LanguageProvider` 的 `useState('en')` 改为 lazy initializer 读 `localStorage`，导致服务端渲染 "Home" 与客户端 "首页" 不匹配。

**修复：** 恢复 `useState('en')` + `useEffect` 同步模式，用 `/* eslint-disable */` 抑制误报——这是需要浏览器 API 才能确定状态的合理用例。

### 7. 修复搜索页结果文字被裁切

**问题：** 搜索结果 `.card-body` 无 padding 规则（只有 `.post-card .card-body` 有），文字紧贴卡片边缘，被 `overflow: hidden` + `border-radius: 20px` 左上角圆角裁掉。

**修复：** 提升 `padding: 20px 22px` 为通用 `.card-body` 规则，所有卡片（文章列表、搜索结果）均受益。

### 8. 代码块添加复制按钮

**新增：** `components/posts/code-block.tsx`（client component），替换 `mdx-components.tsx` 中的 `pre` 组件：
- 顶栏显示语言标签 + Copy 按钮
- 点击调用 `navigator.clipboard.writeText()`，旧浏览器 fallback
- 复制成功后按钮变绿 ✓ Copied，2 秒恢复
- 语言标签从 `rehype-pretty-code` 的 `data-language` 属性读取

### 修改文件

| 文件 | 变更 |
|------|------|
| `app/layout.tsx` | `<script>` → `<Script strategy="beforeInteractive">` |
| `components/layout/language-provider.tsx` | 恢复 `useState('en')` + `useEffect` 同步 |
| `components/ui/language-toggle.tsx` | "中" → "中文" |
| `app/globals.css` | 新增通用 `.card-body` padding；`.copy-btn:hover` |
| `components/posts/code-block.tsx` | **新建** — 带复制按钮的代码块组件 |
| `mdx-components.tsx` | `pre` → `<CodeBlock>`；导出 `components` 对象 |
| `components/posts/mdx-remote.tsx` | 新增 LaTeX 花括号转义预处理器 |
| `components/posts/mdx-content.tsx` | `useMDXComponents()` → 直接 import `components` |
| `components/layout/theme-provider.tsx` | Lazy initializer 替换 `useEffect` setState |
| `components/tutorial/tutorial-sidebar.tsx` | 类型化 `renderNode`；移除 `sidebarReady` |
| `components/tutorial/tutorial-landing-content.tsx` | 删除未使用的 `useEffect` import |
| `app/home-content.tsx` | 删除未使用的 `useTranslation` import |
| `lib/utils.ts` | 删除未使用的 `dateLocaleMap` |
| `README.md` | 重写为专业版 |

---

## 2026-06-03 (周三) — 上午补充

> 完成昨日日报中列出的"明日计划"全部 4 项。

### 1. 修复 ai-capability-dictionary MDX 解析问题

**根因：** 文件包含 LaTeX 数学表达式（`$\mathbf{x}$`、`$$F_\theta(\mathbf{x}, \mathbf{d})$$`），花括号被 MDX 当作 JSX 表达式 → `ReferenceError: x is not defined`。

**修复：** 在 `components/posts/mdx-remote.tsx` 的预处理器中新增 `escapeLatexMathBraces()` 函数，自动转义 `$...$`（行内）和 `$$...$$`（块级）数学公式内的花括号为 HTML 实体。

**结果：** `published: true` 后构建成功，205 页全部生成。

### 2. 处理 dev server 剩余的非阻塞性 React 警告

修复 ESLint 报出的全部源代码 error 和 warning：

| 文件 | 问题 | 修复 |
|------|------|------|
| `app/home-content.tsx` | `useTranslation` 未使用 | 删除 import |
| `components/layout/theme-provider.tsx` | `useEffect` 内同步 `setState` | 改为 `useState` lazy initializer |
| `components/layout/language-provider.tsx` | 同上 | 同上 |
| `components/tutorial/tutorial-sidebar.tsx` | 同上 + `any` 类型 + 未使用变量 | lazy init + 类型化为 `TutorialNode` + 移除 `sidebarReady` |
| `components/tutorial/tutorial-landing-content.tsx` | `useEffect` 未使用 | 删除 import |
| `components/posts/mdx-content.tsx` | `useMDXComponents` 在 async 函数中调用 | 直接 import `components` 对象 |
| `mdx-components.tsx` | 缺少 `components` 导出 | 新增 `export { components }` |
| `lib/utils.ts` | `dateLocaleMap` 未使用 | 删除 |

### 3. 导航栏"中"字修复

**问题：** 语言切换按钮英文模式下显示单个"中"字，不够清晰。

**修复：** `components/ui/language-toggle.tsx` — `"中"` → `"中文"`。

### 4. 图片托管评估

- **现状：** `.git` 363MB（初始导入 971 张图片的历史），工作树仅 5MB。`git gc` 回收仅 7MB。
- **结论：** 当前无紧急需求（< GitHub 1GB 限额）。长期推荐外部 CDN（如 Cloudflare R2）用于未来大图片。

### 其他

- README.md 重写为专业文档，补充教程板块说明，改进架构/功能/设计决策章节。

---

## 2026-06-03 (周三)

### 完成工作

#### Easy-Vibe 教程集成

将 Datawhale 的 [Easy-Vibe](https://github.com/datawhalechina/easy-vibe) AI 编程教程完整迁移到博客中，作为新的 `/tutorial` 版块。

**规模**：
- 187 个 markdown 文件（3 个阶段 + 附录 + Vibe Stories）
- 971 张教程配图
- 185 个静态 HTML 页面成功生成

**技术实现**：
1. **转换脚本** `scripts/convert-tutorial.mjs` — 自动化 VitePress → MDX 转换
   - 剥离 Vue SFC 语法（`<script setup>`、`<style>`、Vue 组件）
   - 转换 `:::` 提示框 → `<div class="admonition">`
   - 200+ 个交互式 Vue Demo → 静态占位符（带原文链接）
   - Element Plus 组件 → CSS 类名
   - 图片路径重写 + 批量复制
   - HTML 注释清理、Vue 模板语法转义、`<` 字符安全处理
2. **数据层** `lib/tutorial.ts` — 递归扫描、导航树构建、前后页计算
3. **路由** — `/tutorial` 落地页 + `/tutorial/[...slug]` 动态内容页
4. **组件** — 课程大纲侧栏（可折叠）、前后导航、CC BY-NC-SA 4.0 署名
5. **集成** — 页头导航链接、双语 i18n、搜索扩展、CSS 样式

**合规**：
- 每页底部标注 CC BY-NC-SA 4.0 许可证 + Datawhale 署名 + 原文链接
- 所有页面 canonical URL 指向 easy-vibe 原文

**已知问题**：
- `ai-capability-dictionary` 1 个文件因 MDX 编译兼容性问题暂时隐藏（`published: false`）

**Commit**: `ea93f68` — 1174 files changed, 101039 insertions
- 随后 `bd98ffa`：移除 Vibe Stories 章节（4 个故事页 + 30 张图片），教程页从 185 减至 181

#### 之前遗留

- 之前提交 `17fbe8f`：标签/chip 样式重设计

#### 教程页渲染修复（19 commits）

排查并修复教程页实际渲染的全部问题，从 15 个编译失败 → 0 个，消除 dev server 所有运行时错误。

**MDX 预处理器** `components/posts/mdx-remote.tsx`：

在编译前自动转换不兼容语法（仅作用于非代码块区域）：

| 转换规则 | 说明 |
|----------|------|
| `<https://...>` → 裸 URL | MDX 误判为 JSX 标签 |
| `{{ expr }}` → HTML 实体 | Vue 模板 vs JSX 表达式冲突 |
| `<template #slot>` → `<div>` | Vue 插槽语法 `#` 无效 |
| `<el-table>` 等 → 代码 | Element UI 自定义标签 |
| `{#id}` → 移除 | Markdown 标题 ID 语法 |
| `<>` / `</>` → 代码 | React Fragment 误触发 |
| `<html>/<body>` → 代码 | 示例标签干扰 |
| `<code>/<pre>` 内 `{}` → 实体 | 花括号被当表达式 |
| `class="..."` → `className` | React DOM 属性要求 |
| `<script>` → 移除 | React 不渲染 script |
| `<p>` / `</p>` → 移除 | 避免段落嵌套 |
| 首个 `# H1` → 移除 | 页面模板已渲染 `<h1>` |
| 剩余 `#` → `##` | 避免多个 H1 |

**标题系统**：
- 172 个 "Index"/"PRD" 通用标题 → 自动从正文首个 `#` 提取真正标题
- `getTutorialBySlug` 提取后同时去掉正文中的重复 H1

**侧边栏**：
- 新增折叠/展开按钮（`◀` / `▶`），状态持久化 localStorage
- 隐藏时正文全宽（CSS `:has()`）
- 滚动位置通过 sessionStorage 跨页保持
- 水合错误修复：localStorage 读取移至 useEffect

**TOC 目录栏**：
- 去掉 `<span id="xxx">` 等 HTML 残留
- 去掉 `[text](url)` Markdown 链接语法

**其他**：
- 删除 115 个文件的 Vue demo 占位块
- 删除重复 `debugging-art/index.mdx`（slug 冲突）
- `<Image>` → `<img>`（教程图片无 width/height）
- 段落组件 `<p>` → `<div>`（避免嵌套违规）
- `<br>` → `<br />`（4 个文件手动修复）

### 遇到问题与解决

| 问题 | 解决 |
|------|------|
| Vue 组件名含数字（A2A、K8s）被通用正则遗漏 | 扩展正则支持 `[A-Z][a-zA-Z0-9]*` 模式 |
| MDX 将 `<10`、`<1ms` 等比较运算符解析为 JSX 标签 | 添加 `<\d` → `&lt;\d` 转义规则 |
| `{{ }}` Vue 模板插值引发 MDX 解析错误 | 包裹在 `` ` `` 代码标记中 |
| `style="..."` 字符串属性引发 React 报错 | 批量移除 content 中的 style 属性 |
| 中文尖括号 `<图像>` 被当作 JSX 标签 | 添加 Unicode 字符转义 |
| 图片 401MB 导致仓库膨胀 | 提交（后续可考虑 Git LFS 或 CDN） |

### 明日计划

- 修复 `ai-capability-dictionary` MDX 解析问题（当前 `published: false`）
- 处理 dev server 剩余的非阻塞性 React 警告
- 考虑图片托管优化（Git LFS 或外部 CDN）
- 导航栏"中"字残留修复

---

## 2026-06-01 (周一)

### 工作内容

#### 1. 标签样式重新设计

**问题：** 文章卡片上的标签使用灰色药丸样式（`var(--surface)` 背景 + 灰色边框），仅在 hover 时才显示主题色，视觉效果平淡，不够吸引点击。

**修复：**
- `.chip` 类默认使用主题色（`--accent-a`）作为文字颜色，`--accent-glow` 作为背景，transparent 边框
- hover 时增加 `translateY(-1px) scale(1.04)` 微动效 + `box-shadow` 发光阴影
- 过渡动画升级为 `cubic-bezier(0.4, 0, 0.2, 1)`，更流畅
- `#` 前缀降低透明度至 55%，让标签名称成为视觉焦点

**冲突处理：** 远端在 `47a2325` 中重构了标签系统——删除了 `app/tags/` 子页面，将 `TagBadge` 从 `<Link>` 改为 `<span>`（标签不再可点击）。通过 rebase 解决冲突：
- 删除 `app/tag-content.tsx`、`app/tags-content.tsx`（接受远端删除）
- `TagBadge` 保留远端的 `<span>`，合并本地的 `#` 前缀样式优化
- `globals.css` 自动合并成功

#### 2. 项目文件整理

将所有项目文件整理到 `BolgWeb/` 子目录下，`.git` 同步移入。整理后根目录仅保留 `BolgWeb/` 和 `.claude/`（会话数据）。

#### 3. 文章样式规范记录

在 memory 中记录三条文章格式要求：
- 表格内文字居中展示
- 代码块要有复制按钮
- 隐藏标签前的 `#` 号，标签位置放在标题和正文之间

### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `app/globals.css` | `.chip` 类重新设计：主题色背景/文字、hover 动效 |
| `components/ui/tag-badge.tsx` | `#` 前缀分离为独立 span，降低透明度；接受远端 `<span>` 替代 `<Link>` |
| `app/tag-content.tsx` | 已删除（远端重构） |
| `app/tags-content.tsx` | 已删除（远端重构） |

### 提交记录

| Commit | 内容 |
|--------|------|
| `17fbe8f` | style: redesign tag/chip badges with accent colors and hover lift effect |

### 备注

- 移动文件到 BolgWeb 后 `npm run build` 通过，18 routes 全部生成成功
- 当前未提交文件：`public/feed.xml`（RSS 生成文件）、`Picture/`、`daily-report-*.md`、`daily-summary.md`
- 标签子页面（`/tags`、`/tags/[tag]`）已由远端重构移除，网站共 8 routes（首页、关于、文章列表、文章详情×11、分类×4、搜索）

---

## 2026-05-30 (周五)

### 工作内容

#### 1. 修复代码块颜色突兀问题

**问题：** `mdx-components.tsx` 中 `pre`、`code`、`hr`、`table`、`th`、`td`、`blockquote` 使用了硬编码的暗色主题颜色（如 `rgba(0,0,0,0.3)`、`rgba(255,255,255,0.08)`、`#fff`），在亮色模式下极度突兀。

**修复：** 将所有硬编码颜色替换为 `globals.css` 中已定义的主题 CSS 变量（`var(--pre-bg)`、`var(--border)`、`var(--text-2)`、`var(--surface)` 等），使代码块在亮/暗模式下均能自动适配。

**额外优化：** `code` 组件移除背景/边框/内边距，仅保留字体样式。行内代码的视觉效果交由 `.prose :not(pre) > code` CSS 规则处理，避免 `pre > code` 出现嵌套框。

#### 2. 翻译 SSH 密钥设置指南

- 将 `content/posts/ssh-keys-setup-guide.mdx` 从英文翻译为中文
- 标题、段落、表格、提示块全部翻译，代码块和命令保持原文
- 元数据 `lang` 改为 `zh-CN`

#### 3. 修复 GFM 表格渲染失败

**问题：** Markdown 表格在页面上显示为纯文本（`| col1 | col2 |`）而非 HTML 表格。

**根因：** `mdx-remote.tsx` 中的 `evaluate()` 运行时编译没有传入 `remark-gfm` 等插件，`next.config.ts` 中的插件配置仅作用于构建时的 `.mdx` 页面文件。

**修复：** 在 `evaluate()` 调用中添加 `remarkGfm`、`rehypeSlug`、`rehypePrettyCode` 插件，确保运行时编译与构建时行为一致。

#### 4. 修复 MDX 组件样式被覆盖

**问题：** `th`/`td`/`pre`/`code` 组件中 `{...props}` 在 `style` 之后展开，GFM 表格插件传入的 `style={{textAlign:'left'}}` 会完全覆盖组件默认的 CSS 变量样式。

**修复：** 从 props 中解构 `style`，通过 `...(propStyle as React.CSSProperties)` 合并到默认 `style` 对象中，确保组件默认样式与 MDX 编译器传入的样式正确合并。

### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `mdx-components.tsx` | 硬编码颜色 → CSS 变量；修复 style 合并顺序 |
| `components/posts/mdx-remote.tsx` | evaluate() 添加 remark/rehype 插件 |
| `content/posts/ssh-keys-setup-guide.mdx` | 英文翻译为中文 |

### 提交记录

| Commit | 内容 |
|--------|------|
| `e20b0ed` | fix: replace hardcoded dark-theme colors with CSS variables in MDX components |
| `37bb118` | i18n: translate SSH keys setup guide to Chinese |
| `800e22c` | fix: add remark-gfm + rehype plugins to runtime MDX, merge styles properly |

### 备注

- 网站部署在 Cloudflare Pages，推送 `main` 分支后自动部署
- `public/feed.xml` 有未关联的改动（RSS feed 更新），未包含在本次提交中
