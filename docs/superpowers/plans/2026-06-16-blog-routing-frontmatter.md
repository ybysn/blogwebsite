# Blog Routing And Frontmatter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix tutorial search routing, normalize the site domain, strengthen frontmatter validation, and install dependencies without changing the existing tag styling.

**Architecture:** Keep Easy-Vibe content as migrated MDX under this site's `/tutorial/...` namespace. Use `original_url` only for attribution/canonical references back to the VitePress source site, and use explicit internal `href` values for all local search links.

**Tech Stack:** Next.js 16 App Router, TypeScript, MDX, gray-matter, Node.js built-in test runner, npm.

---

### Task 1: Dependency Baseline

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Install dependencies inside the workspace cache**

Run:

```powershell
npm.cmd install --cache .npm-cache --proxy=http://127.0.0.1:10808 --https-proxy=http://127.0.0.1:10808
```

Expected: dependencies install, `node_modules/` remains ignored, and `.npm-cache/` is ignored after the `.gitignore` update.

### Task 2: Search URL Model

**Files:**
- Modify: `types/index.ts`
- Modify: `lib/search.ts`
- Modify: `components/posts/search-input.tsx`
- Test: `tests/content-integrity.test.mjs`

- [ ] **Step 1: Write a failing test for search hrefs**

Create `tests/content-integrity.test.mjs` with a test that asserts every search document has a direct `href`, post hrefs start with `/posts/`, and tutorial hrefs start with `/tutorial/`.

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```powershell
node --test tests/content-integrity.test.mjs
```

Expected before implementation: fail because `SearchDocument` has no `href` and the search UI hard-codes `/posts/${item.slug}`.

- [ ] **Step 3: Add `href` to search documents**

Set post documents to `href: /posts/<slug>` and tutorial documents to `href: /tutorial/<slug>`. Update the search result link to use `item.href`.

- [ ] **Step 4: Run the test and confirm it passes**

Run:

```powershell
node --test tests/content-integrity.test.mjs
```

Expected: pass.

### Task 3: Domain Consistency

**Files:**
- Modify: `scripts/generate-rss.mjs`
- Test: `tests/content-integrity.test.mjs`

- [ ] **Step 1: Write a failing test for canonical site domain**

In `tests/content-integrity.test.mjs`, assert both `lib/constants.ts` and `scripts/generate-rss.mjs` use `https://blog.ybysn.org`.

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```powershell
node --test tests/content-integrity.test.mjs
```

Expected before implementation: fail because RSS still uses `https://ny.ybysn.org`.

- [ ] **Step 3: Update RSS site URL**

Change `scripts/generate-rss.mjs` to use `https://blog.ybysn.org`.

### Task 4: Frontmatter Validation

**Files:**
- Modify: `types/index.ts`
- Modify: `lib/posts.ts`
- Modify: `lib/tutorial.ts`
- Test: `tests/content-integrity.test.mjs`

- [ ] **Step 1: Write a failing content validation test**

In `tests/content-integrity.test.mjs`, parse all post and tutorial MDX files with `gray-matter` and assert required fields are present and typed. Posts require `title`, `date`, `description`, `tags`, `published`, `lang`, and `category`. Tutorials require `title`, `date`, `tags`, `published`, `stage`, `lang`, and `original_url`; `description` remains optional because many migrated Easy-Vibe pages do not provide one and the page metadata falls back to the title.

- [ ] **Step 2: Run the test**

Run:

```powershell
node --test tests/content-integrity.test.mjs
```

Expected before implementation: pass for existing content, but production validation remains weaker than the test.

- [ ] **Step 3: Strengthen production validators and types**

Update `PostFrontmatter` so `lang` and `category` are required. Update `TutorialFrontmatter` so `lang` and `original_url` are required. Update `validateFrontmatter()` in `lib/posts.ts` and `lib/tutorial.ts` to enforce those fields.

### Task 5: Full Verification

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run content tests**

```powershell
node --test tests/content-integrity.test.mjs
```

- [ ] **Step 2: Run lint**

```powershell
npm.cmd run lint
```

- [ ] **Step 3: Run static build**

```powershell
npm.cmd run build
```

Expected: all commands exit 0. If build exposes migrated MDX syntax issues, fix the minimal compatibility gap and rerun.
