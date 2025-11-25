# Implementation Plan – Missing Features (35+ Commits)

**All commits will be applied directly to the `main` branch** (no intermediate feature branch). The plan retains the same 38‑commit roadmap, but the execution notes now reflect committing straight to `main`.

## 1️⃣ Project Setup & CI
- **Commit 1**: `chore: initialize conventional‑commit linting (commitlint)`
- **Commit 2**: `chore: add husky pre‑commit hook (lint‑staged)`
- **Commit 3**: `chore: configure CI workflow (GitHub Actions)`
- **Commit 4**: `test: add basic Jest config for TS`

## 2️⃣ WalletConnect Metadata Fix
- **Commit 5**: `fix: sync WalletConnect metadata URL with Vercel deployment`
- **Commit 6**: `test: add unit test for metadata object`

## 3️⃣ Preload & Asset Headers
- **Commit 7**: `fix: remove unused <link rel="preload"> tags`
- **Commit 8**: `feat: add proper “as” attributes to remaining preloads`
- **Commit 9**: `fix: set explicit Content‑Type headers for CSS/JS on Vercel`
- **Commit 10**: `test: verify headers via integration test (playwright)`

## 4️⃣ SVG Corrections
- **Commit 11**: `fix: correct malformed width/height in SVG icons`
- **Commit 12**: `test: snapshot test for SVG rendering`

## 5️⃣ UI Polish – Premium Design
- **Commit 13**: `style: add global CSS variables for dark mode palette`
- **Commit 14**: `style: implement glassmorphism card component`
- **Commit 15**: `style: add micro‑animation utilities (fade/slide)`
- **Commit 16**: `feat: refactor Header to use GlassCard & dark theme`
- **Commit 17**: `test: visual regression test for Header (playwright)`
- **Commit 18**: `style: ensure responsive layout (mobile breakpoints)`
- **Commit 19**: `feat: add dark‑mode toggle with persistence`
- **Commit 20**: `test: unit test for dark‑mode hook`

## 6️⃣ Compiler UI Enhancements
- **Commit 21**: `feat: expose compile button with loading spinner`
- **Commit 22**: `feat: display compilation errors/warnings in a toast`
- **Commit 23**: `test: e2e test for successful compilation flow`
- **Commit 24**: `test: e2e test for compilation error handling`

## 7️⃣ Testing Utilities
- **Commit 25**: `feat: replace window.testCompiler with a proper test harness`
- **Commit 26**: `test: unit tests for test harness API`
- **Commit 27**: `doc: update README with test harness usage`

## 8️⃣ Documentation & README
- **Commit 28**: `doc: add “Getting Started” section with Vercel deploy button`
- **Commit 29**: `doc: add “Architecture Overview” diagram (Mermaid)`
- **Commit 30**: `doc: list all environment variables & defaults`
- **Commit 31**: `doc: add contribution guidelines (CODE_OF_CONDUCT, CONTRIBUTING)`

## 9️⃣ Final Polish & Release Prep
- **Commit 32**: `refactor: extract compiler logic into separate service class`
- **Commit 33**: `test: unit tests for CompilerService`
- **Commit 34**: `chore: bump version to 1.0.0`
- **Commit 35**: `feat: add “About” modal with project info`
- **Commit 36**: `style: improve accessibility (ARIA labels, focus order)`
- **Commit 37**: `test: accessibility audit with axe‑core (jest‑axe)`
- **Commit 38**: `release: tag v1.0.0 and generate changelog`

---

**Execution notes (main‑branch workflow)**
- For each commit, run `git add -p` to stage only the intended changes, then `git commit -m "<message>"` directly on `main`.
- After each commit, run the full test suite (`npm test && npm run playwright:test`).
- If a commit fails CI, fix the issue locally, amend the commit (`git commit --amend`), and push with `--force-with-lease`.
- Once all 38 commits are applied, the `main` branch will contain the complete feature set, ready for production deployment.
