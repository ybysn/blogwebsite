import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import matter from 'gray-matter'

const ROOT = process.cwd()
const SITE_URL = 'https://blog.ybysn.org'
const LOCALES = new Set(['en', 'zh-CN'])
const REQUIRED_LOCALE_TYPE = /lang:\s*(?:string|ContentLocale|Locale)/

function read(filePath) {
  return fs.readFileSync(path.join(ROOT, filePath), 'utf8')
}

function walkMdx(dir) {
  const results = []

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
        results.push(fullPath)
      }
    }
  }

  walk(path.join(ROOT, dir))
  return results
}

function frontmatter(filePath) {
  return matter(fs.readFileSync(filePath, 'utf8')).data
}

function categoryIds() {
  const source = read('lib/categories.ts')
  return new Set([...source.matchAll(/id:\s*'([^']+)'/g)].map((match) => match[1]))
}

function assertStringField(data, field, filePath) {
  assert.equal(typeof data[field], 'string', `${filePath} must define string ${field}`)
  assert.notEqual(data[field].trim(), '', `${filePath} must define non-empty ${field}`)
}

function assertTags(data, filePath) {
  assert.ok(Array.isArray(data.tags), `${filePath} must define tags array`)
  assert.ok(data.tags.length > 0, `${filePath} must include at least one tag`)
  for (const tag of data.tags) {
    assert.equal(typeof tag, 'string', `${filePath} tags must be strings`)
    assert.notEqual(tag.trim(), '', `${filePath} tags must be non-empty`)
  }
}

test('site URL is consistent across metadata and RSS generation', () => {
  assert.match(read('lib/constants.ts'), new RegExp(`SITE_URL\\s*=\\s*'${SITE_URL}'`))
  assert.match(read('scripts/generate-rss.mjs'), new RegExp(`SITE_URL\\s*=\\s*'${SITE_URL}'`))
})

test('search documents expose direct internal hrefs for posts and tutorials', () => {
  const typesSource = read('types/index.ts')
  const searchSource = read('lib/search.ts')
  const searchInputSource = read('components/posts/search-input.tsx')

  assert.match(typesSource, /href:\s*string/, 'SearchDocument must include href')
  assert.match(searchSource, /href:\s*`\/posts\/\$\{post\.slug\}`/, 'post documents must link to /posts/<slug>')
  assert.match(searchSource, /href:\s*`\/tutorial\/\$\{t\.slug\}`/, 'tutorial documents must link to /tutorial/<slug>')
  assert.match(searchInputSource, /href=\{item\.href\}/, 'search UI must use the direct href')
  assert.doesNotMatch(searchInputSource, /href=\{`\/posts\/\$\{item\.slug\}`\}/, 'search UI must not force every result under /posts')
})

test('post detail header renders title before tags and metadata', () => {
  const source = read('app/posts/[slug]/page.tsx')
  const headerStart = source.indexOf('<header')
  const h1Index = source.indexOf('<h1', headerStart)
  const tagsIndex = source.indexOf('meta.tags.map', headerStart)
  const metaIndex = source.indexOf('<PostMetaDisplay', headerStart)

  assert.ok(headerStart >= 0, 'post page must render a header')
  assert.ok(h1Index > headerStart, 'post title must be inside the header')
  assert.ok(tagsIndex > h1Index, 'post tags must render below the title')
  assert.ok(metaIndex > tagsIndex, 'post metadata must render below the tags')
})

test('tutorial detail header renders title before tags and metadata', () => {
  const source = read('app/tutorial/[...slug]/page.tsx')
  const headerStart = source.indexOf('<header')
  const stageIndex = source.indexOf('tutorial-stage-badge', headerStart)
  const h1Index = source.indexOf('<h1', headerStart)
  const tagsIndex = source.indexOf('meta.tags.map', headerStart)
  const metaIndex = source.indexOf('<PostMetaDisplay', headerStart)

  assert.ok(headerStart >= 0, 'tutorial page must render a header')
  assert.ok(stageIndex > headerStart, 'tutorial stage badge must stay inside the header')
  assert.ok(h1Index > stageIndex, 'tutorial title must render below the stage badge')
  assert.ok(tagsIndex > h1Index, 'tutorial tags must render below the title')
  assert.ok(metaIndex > tagsIndex, 'tutorial metadata must render below the tags')
})

test('article font preference is initialized before hydration and exposed in the header', () => {
  const layoutSource = read('app/layout.tsx')
  const headerSource = read('components/layout/header.tsx')
  const providerSource = read('components/layout/article-font-provider.tsx')
  const toggleSource = read('components/ui/article-font-toggle.tsx')

  assert.match(
    layoutSource,
    /<Script id="article-font-init" strategy="beforeInteractive">/,
    'article font preference must be applied before hydration',
  )
  assert.match(
    layoutSource,
    /<ArticleFontProvider>/,
    'root layout must wrap the header with ArticleFontProvider',
  )
  assert.match(
    headerSource,
    /<ArticleFontToggle \/>/,
    'header must expose the article font switcher',
  )
  assert.match(
    providerSource,
    /localStorage\.getItem\('article-font'\)/,
    'article font preference must be read from localStorage',
  )
  assert.match(
    providerSource,
    /document\.documentElement\.dataset\.articleFont/,
    'article font preference must be applied to the document dataset',
  )
  assert.match(
    toggleSource,
    /ARTICLE_FONT_OPTIONS/,
    'article font switcher must render the shared font options',
  )
})

test('article font CSS applies only to reading surfaces and preserves code font', () => {
  const css = read('app/globals.css')

  assert.match(css, /--font-article-sans:/, 'default reading font stack must be defined')
  assert.match(css, /--font-article-serif:/, 'serif reading font stack must be defined')
  assert.match(css, /--font-article-kai:/, 'kai reading font stack must be defined')
  assert.match(
    css,
    /\[data-article-font='serif'\]\s*\{\s*--font-article:\s*var\(--font-article-serif\);/s,
    'serif preference must switch the reading font variable',
  )
  assert.match(
    css,
    /\[data-article-font='kai'\]\s*\{\s*--font-article:\s*var\(--font-article-kai\);/s,
    'kai preference must switch the reading font variable',
  )
  assert.match(
    css,
    /\.post-article\s+>\s+header h1,\s*\.tutorial-article\s+>\s+header h1,\s*\.post-article\s+>\s+\.prose,\s*\.tutorial-article\s+>\s+\.prose\s*\{\s*font-family:\s*var\(--font-article\);/s,
    'reading font must be scoped to article titles and prose content',
  )
  assert.match(
    css,
    /\.prose code\s*\{\s*font-family:\s*var\(--font-mono\);/s,
    'inline code must continue to use the monospace stack',
  )
})

test('article reading CSS improves long-form prose without affecting chrome', () => {
  const css = read('app/globals.css')

  assert.match(
    css,
    /\.post-article\s+>\s+\.prose,\s*\.tutorial-article\s+>\s+\.prose\s*\{[^}]*color:\s*var\(--text\);/s,
    'article prose must use the primary text color instead of inheriting muted body text',
  )
  assert.match(
    css,
    /\.post-article\s+>\s+\.prose,\s*\.tutorial-article\s+>\s+\.prose\s*\{[^}]*font-size:\s*clamp\(1rem,\s*0\.96rem \+ 0\.25vw,\s*1\.075rem\);/s,
    'article prose must use the requested responsive reading font size',
  )
  assert.match(
    css,
    /\.post-article\s+>\s+\.prose,\s*\.tutorial-article\s+>\s+\.prose\s*\{[^}]*line-height:\s*1\.88;/s,
    'article prose must use a Chinese long-form reading line height',
  )
  assert.match(
    css,
    /\.post-article\s+>\s+\.prose,\s*\.tutorial-article\s+>\s+\.prose\s*\{[^}]*letter-spacing:\s*0;/s,
    'article prose must not inherit the global body letter spacing',
  )
  assert.match(
    css,
    /\.post-article\s+>\s+\.prose,\s*\.tutorial-article\s+>\s+\.prose\s*\{[^}]*max-width:\s*780px;/s,
    'article prose must keep long lines within a comfortable width',
  )
  assert.match(
    css,
    /\.post-article\s*\{[^}]*max-width:\s*780px;/s,
    'blog article containers must allow the requested prose width',
  )
  assert.match(
    css,
    /\.tutorial-layout:has\(\.tutorial-sidebar--hidden\)\s+\.tutorial-article\s*\{[^}]*max-width:\s*780px;/s,
    'tutorial pages without the sidebar must still cap prose line length',
  )
  assert.match(css, /\.prose p\s*\{[^}]*margin:\s*1\.1em 0;[^}]*line-height:\s*1\.88;/s)
  assert.match(css, /\.prose li\s*\{[^}]*line-height:\s*1\.88;[^}]*margin:\s*0\.4em 0;/s)
  assert.match(css, /\.prose h2\s*\{[^}]*margin-top:\s*2\.4em;[^}]*margin-bottom:\s*0\.8em;[^}]*line-height:\s*1\.35;/s)
  assert.match(css, /\.prose h3\s*\{[^}]*margin-top:\s*1\.8em;[^}]*margin-bottom:\s*0\.6em;[^}]*line-height:\s*1\.4;/s)
  assert.match(css, /\.prose blockquote\s*\{[^}]*color:\s*var\(--text-2\);/s)
  assert.doesNotMatch(css, /\.prose blockquote\s*\{[^}]*color:\s*var\(--text-3\);/s)
})

test('MDX prose components preserve paragraph semantics and defer reading rhythm to CSS', () => {
  const source = read('mdx-components.tsx')

  assert.match(
    source,
    /p:\s*\(\{ children,\s*\.\.\.props \}\)\s*=>\s*\(\s*<p\b/s,
    'MDX paragraph component must render semantic p elements',
  )
  assert.doesNotMatch(
    source,
    /p:\s*\(\{ children,\s*\.\.\.props \}\)\s*=>\s*\(\s*<div\b/s,
    'MDX paragraph component must not render div elements',
  )
  assert.doesNotMatch(
    source,
    /lineHeight:\s*1\.65/,
    'MDX components must not hard-code the old paragraph line height',
  )
  for (const heading of ['h2', 'h3', 'h4']) {
    assert.doesNotMatch(
      source,
      new RegExp(`${heading}:\\s*\\([\\s\\S]*?style=\\{\\{[\\s\\S]*?marginTop`),
      `MDX ${heading} rhythm should be controlled by CSS, not inline margin styles`,
    )
  }
})

test('article tables render as compact key-value configuration tables', () => {
  const css = read('app/globals.css')
  const mdxSource = read('mdx-components.tsx')
  const postPageSource = read('app/posts/[slug]/page.tsx')
  const tutorialPageSource = read('app/tutorial/[...slug]/page.tsx')

  assert.match(
    postPageSource,
    /className="prose article-content"/,
    'post markdown content must be scoped for article table styles',
  )
  assert.match(
    tutorialPageSource,
    /className="prose article-content"/,
    'tutorial markdown content must be scoped for article table styles',
  )
  assert.match(
    css,
    /\.article-content table\s*\{[^}]*width:\s*fit-content;[^}]*min-width:\s*520px;[^}]*max-width:\s*100%;[^}]*margin:\s*16px 0 26px;[^}]*border-radius:\s*8px;[^}]*font-size:\s*15px;[^}]*line-height:\s*1\.55;[^}]*background:\s*#fff;/s,
    'article tables must use compact key-value sizing instead of filling the reading column',
  )
  assert.match(
    css,
    /\.article-content tbody td:first-child\s*\{[^}]*width:\s*110px;[^}]*font-weight:\s*600;[^}]*white-space:\s*nowrap;[^}]*background:\s*#fafafa;/s,
    'field column must stay narrow and stable',
  )
  assert.match(
    css,
    /\.article-content tbody td:last-child\s*\{[^}]*min-width:\s*280px;[^}]*max-width:\s*520px;/s,
    'value column must stay compact while leaving room for values',
  )
  assert.match(
    css,
    /\.article-content table code\s*\{[^}]*padding:\s*1px 5px;[^}]*border:\s*none;[^}]*border-radius:\s*4px;[^}]*background:\s*#f3f4f6;[^}]*line-height:\s*1\.45;[^}]*white-space:\s*normal;[^}]*word-break:\s*break-all;/s,
    'inline code inside tables must read as compact code, not buttons',
  )
  assert.doesNotMatch(
    css,
    /\.article-content table code\s*\{[^}]*display:\s*inline-block;/s,
    'table code must not become button-like inline blocks',
  )
  assert.match(
    css,
    /@media\s*\(max-width:\s*640px\)\s*\{[\s\S]*?\.article-content table\s*\{[^}]*width:\s*100%;[^}]*min-width:\s*0;[^}]*font-size:\s*14px;[\s\S]*?\.article-content tbody td:first-child\s*\{[^}]*width:\s*88px;[\s\S]*?\.article-content tbody td:last-child\s*\{[^}]*min-width:\s*0;/s,
    'compact tables must relax width constraints on mobile',
  )
  assert.doesNotMatch(
    mdxSource,
    /table:\s*\(\{ children,\s*\.\.\.props \}\)\s*=>[\s\S]*?margin:\s*'0 auto'/,
    'MDX table renderer must not center tables with inline styles',
  )
  assert.doesNotMatch(
    mdxSource,
    /table:\s*\(\{ children,\s*\.\.\.props \}\)\s*=>[\s\S]*?width:\s*'auto'/,
    'MDX table renderer must not force auto-width inline styles',
  )
})

test('static export SEO files expose sitemap and robots metadata', () => {
  const nextConfigSource = read('next.config.ts')
  const sitemapSource = read('app/sitemap.ts')
  const robotsSource = read('app/robots.ts')

  assert.match(nextConfigSource, /output:\s*'export'/, 'site must stay configured for static export')
  assert.match(sitemapSource, /MetadataRoute\.Sitemap/, 'sitemap must use the Next metadata route type')
  assert.match(sitemapSource, /export const dynamic = 'force-static'/, 'sitemap must be compatible with static export')
  assert.match(sitemapSource, /getAllPosts\(\)/, 'sitemap must include published posts')
  assert.match(sitemapSource, /getAllTutorials\(\)/, 'sitemap must include published tutorials')
  assert.match(sitemapSource, /`\$\{SITE_URL\}\/posts\/\$\{post\.slug\}`/, 'sitemap must include post detail URLs')
  assert.match(sitemapSource, /`\$\{SITE_URL\}\/tutorial\/\$\{tutorial\.slug\}`/, 'sitemap must include tutorial detail URLs')
  assert.match(sitemapSource, /`\$\{SITE_URL\}\/posts`/, 'sitemap must include the posts index')
  assert.match(sitemapSource, /`\$\{SITE_URL\}\/tutorial`/, 'sitemap must include the tutorial index')
  assert.match(sitemapSource, /lastModified:\s*new Date\(post\.date\)/, 'post sitemap entries must use post dates')
  assert.match(sitemapSource, /lastModified:\s*new Date\(tutorial\.date\)/, 'tutorial sitemap entries must use tutorial dates')

  assert.match(robotsSource, /MetadataRoute\.Robots/, 'robots must use the Next metadata route type')
  assert.match(robotsSource, /export const dynamic = 'force-static'/, 'robots must be compatible with static export')
  assert.match(robotsSource, /userAgent:\s*'\*'/, 'robots must define the global user agent')
  assert.match(robotsSource, /allow:\s*'\/'/, 'robots must allow site crawling')
  assert.match(robotsSource, /sitemap:\s*`\$\{SITE_URL\}\/sitemap\.xml`/, 'robots must point to the sitemap URL')
})

test('Giscus comment section border follows the active theme', () => {
  const source = read('components/posts/giscus.tsx')

  assert.match(
    source,
    /borderTop:\s*'1px solid var\(--border\)'/,
    'Giscus section border must use the theme border variable',
  )
  assert.doesNotMatch(
    source,
    /borderTop:\s*'1px solid rgba\(255,255,255,0\.08\)'/,
    'Giscus section border must not use a hard-coded dark-only color',
  )
})

test('post frontmatter is complete and uses known categories', () => {
  const validCategories = categoryIds()
  const files = walkMdx('content/posts')
  const typesSource = read('types/index.ts')
  const postsSource = read('lib/posts.ts')

  assert.match(typesSource, REQUIRED_LOCALE_TYPE, 'PostFrontmatter lang must be required')
  assert.match(typesSource, /category:\s*string/, 'PostFrontmatter category must be required')
  assert.match(postsSource, /typeof data\.lang === 'string'/, 'post validator must require lang')
  assert.match(postsSource, /typeof data\.category === 'string'/, 'post validator must require category')

  assert.ok(files.length > 0, 'expected at least one post')

  for (const file of files) {
    const relative = path.relative(ROOT, file)
    const data = frontmatter(file)

    for (const field of ['title', 'date', 'description', 'lang', 'category']) {
      assertStringField(data, field, relative)
    }
    assertTags(data, relative)
    assert.equal(typeof data.published, 'boolean', `${relative} must define boolean published`)
    assert.ok(LOCALES.has(data.lang), `${relative} lang must be en or zh-CN`)
    assert.ok(validCategories.has(data.category), `${relative} category must exist in lib/categories.ts`)
    assert.ok(!Number.isNaN(Date.parse(data.date)), `${relative} date must be parseable`)
  }
})

test('tutorial frontmatter preserves source attribution while using local slugs', () => {
  const files = walkMdx('content/tutorial')
  const typesSource = read('types/index.ts')
  const tutorialSource = read('lib/tutorial.ts')

  assert.ok(files.length > 0, 'expected at least one tutorial page')

  assert.match(typesSource, REQUIRED_LOCALE_TYPE, 'TutorialFrontmatter lang must be required')
  assert.match(typesSource, /original_url:\s*string/, 'TutorialFrontmatter original_url must be required')
  assert.match(tutorialSource, /typeof data\.lang === 'string'/, 'tutorial validator must require lang')
  assert.match(
    tutorialSource,
    /typeof data\.original_url === 'string'/,
    'tutorial validator must require original_url',
  )

  for (const file of files) {
    const relative = path.relative(ROOT, file)
    const data = frontmatter(file)

    for (const field of ['title', 'date', 'lang', 'original_url']) {
      assertStringField(data, field, relative)
    }
    if (data.description !== undefined) {
      assertStringField(data, 'description', relative)
    }
    assertTags(data, relative)
    assert.equal(typeof data.published, 'boolean', `${relative} must define boolean published`)
    assert.equal(typeof data.stage, 'number', `${relative} must define numeric stage`)
    assert.ok(LOCALES.has(data.lang), `${relative} lang must be en or zh-CN`)
    assert.match(
      data.original_url,
      /^https:\/\/datawhalechina\.github\.io\/easy-vibe\/zh-cn\//,
      `${relative} original_url must point to the Easy-Vibe zh-cn source`,
    )
    assert.ok(!Number.isNaN(Date.parse(data.date)), `${relative} date must be parseable`)
  }
})
