# Pocket Gull Workspace Rules

## Node.js Version
- **Strict Requirement**: Use **Node.js v24.x** for all local development, testing, and CI/CD pipelines. This is configured in `.node-version`, `.nvmrc`, and root `package.json` (`engines`).

## Package Overrides (esbuild Version Mismatch Workaround)
- To prevent version mismatch crashes with `esbuild` in the monorepo workspace environment, `esbuild` version overrides are structured as follows:
  - **Global default override**: Set `esbuild` (and all platform binaries `@esbuild/*`) to `0.27.2`.
  - **Angular CLI specific override**: Override `esbuild` (and all platform-specific `@esbuild/*` binaries) to `0.28.1` specifically under `@angular/build` and `@angular-devkit/build-angular`.
  - **Astro Promotion**: `astro` and `@astrojs/mdx` are included as direct root devDependencies to ensure their transitive `esbuild` dependencies are correctly caught by the root context overrides, bypassing npm workspace link boundary resolution bugs.
- **Note**: Do not modify these overrides without full regression testing of both the Angular build and the Astro `docs-study` workspace build.

## Python / FastAPI Standards
- **Validation**: All request and response models in the `pocketgull_api` sidecar MUST be strictly typed using Pydantic models. Avoid returning untyped dictionaries.
- **Async Execution**: Ensure all route handlers and I/O-bound functions (like calling external APIs or ML models) use `async`/`await` to prevent blocking the event loop.
- **Formatting**: Adhere to PEP-8 standards. Use `black` and `ruff` for formatting and linting.

## Flutter / Dart Architecture
- **State Management**: Use **Riverpod** for state management across the `pocketgull_flutter` companion app. Avoid `setState` for complex business logic.
- **Widget Composability**: Keep widget classes small and focused. Extract deeply nested UI trees into standalone, reusable, stateless widgets.
- **Null Safety**: Strict null safety must be maintained at all times.

## Commit Message Convention
- **Format**: Follow the **Conventional Commits** specification strictly: `<type>(<scope>): <description>`
- **Types**: `feat`, `fix`, `docs`, `test`, `security`, `chore`, `refactor`, `perf`, `style`, `ci`, `build`
- **Scope**: Use a bracketed category tag that identifies the sub-system. Common scopes include:
  - `ui`, `ux`, `layout`, `theme`, `print` — Frontend visual changes
  - `ai`, `gemini`, `adk`, `voice` — AI and voice integration
  - `clinical`, `fhir`, `intake`, `triage` — Clinical intelligence and data
  - `server`, `ssr`, `api` — Backend / Express / SSR
  - `flutter`, `dart`, `mobile` — Flutter companion apps
  - `python`, `ml`, `sidecar` — Python FastAPI sidecar
  - `security`, `csp`, `codeql`, `hipaa` — Security hardening
  - `ci`, `cd`, `docker`, `deploy`, `cloudrun` — CI/CD and infrastructure
  - `demo`, `mock` — Demo mode and mock data
  - `e2e`, `playwright`, `test` — Testing
  - `three`, `anatomy`, `3d` — Three.js anatomy viewer
  - `sentinel`, `companion` — Sentinel triage and companion apps
  - `types`, `build`, `deps` — TypeScript types, build config, dependencies
- **Subject line rules**:
  - Use imperative mood ("add", "fix", "remove", not "added", "fixes", "removed")
  - Do NOT capitalize the first letter of the description
  - No period at the end
  - Max 72 characters for the full subject line
- **Body** (optional): If the diff is non-trivial, add a blank line after the subject, then a concise body explaining *why* the change was made, not *what* (the diff shows what). Wrap at 80 characters.
- **Breaking changes**: Prefix the body with `BREAKING CHANGE:` if the commit introduces breaking changes.
- **Examples of good commit messages**:
  - `feat(ai): add Gemini 2.5 Flash streaming to voice assistant`
  - `fix(clinical): sync intake form keys with care plan report structure`
  - `security(server): sanitize Vertex AI URL params against SSRF`
  - `chore(deps): bump Angular to v22.1 and resolve esbuild overrides`
  - `feat(demo): add dynamic mock clinical assessments per patient demographics`
  - `fix(types): add explicit token loop types in analysis-report parser`

## FHIR R4 Compliance
- **Data Serialization**: Anytime patient data (symptoms, history, conditions) is serialized, exported, or passed across API boundaries, the payload MUST strictly conform to the **FHIR R4 Bundle** standard.
- **Sanitization**: All incoming/outgoing string data must be sanitized using DOMPurify before being stored or rendered to ensure HIPAA-compatible privacy and security.

## Default Node & TypeScript Commands
- **Strict Requirement**: Always use the explicit project Node module paths for typechecking and builds to prevent PATH resolution mismatches:
  - **TypeScript Typecheck**: `node c:\Users\philg\Pocketgull\pocketgull\node_modules\typescript\lib\tsc.js -p c:\Users\philg\Pocketgull\pocketgull\tsconfig.json --noEmit`
  - **Angular Build**: `node c:\Users\philg\Pocketgull\pocketgull\node_modules\@angular\cli\bin\ng.js build`
