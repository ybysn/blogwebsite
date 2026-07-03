# Plan: 博客新增「学习笔记」栏目 (DSA 学习)

## 现状
- dsa-notes 仓库：91 天 DSA 学习计划，用户已完成 Day01、Day02
- 博客导航：首页、搜索、文章、教程、工具、关于
- 文章用 MDX 存放在 content/posts/

## 目标
在博客中新增「笔记」栏目，发布用户已完成的 DSA 学习内容。

## 步骤

### 1. 导航添加「笔记」
- `components/layout/header.tsx` - NAV_LINKS 加 `{ href: '/notes', label: '笔记' }`

### 2. 创建笔记路由
- `app/notes/page.tsx` - 笔记列表页（列出所有笔记，按时间倒序）
- `app/notes/[slug]/page.tsx` - 笔记详情页
- `app/notes/notes-content.tsx` - 客户端组件

### 3. 创建内容目录和工具函数
- `content/notes/` - 存放笔记 MDX 文件
- `lib/notes.ts` - 读取笔记元数据（类似 lib/posts.ts）

### 4. 写入 Day01、Day02 笔记
- `content/notes/dsa-day01-python-objects.mdx` - Python 对象与基础表达
- `content/notes/dsa-day02-conditionals-loops.mdx` - 条件、循环、函数与异常

### 5. 构建验证
- `npm run build` 确认无报错

## 文件清单
| 操作 | 文件 |
|------|------|
| 修改 | components/layout/header.tsx |
| 新建 | app/notes/page.tsx |
| 新建 | app/notes/[slug]/page.tsx |
| 新建 | app/notes/notes-content.tsx |
| 新建 | lib/notes.ts |
| 新建 | content/notes/dsa-day01-python-objects.mdx |
| 新建 | content/notes/dsa-day02-conditionals-loops.mdx |

## 笔记格式
每篇笔记含 frontmatter(title, date, tags, excerpt) + 正文（提取关键知识点，保持教材结构但更简洁）
