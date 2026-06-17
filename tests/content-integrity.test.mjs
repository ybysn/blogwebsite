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
