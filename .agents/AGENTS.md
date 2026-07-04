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

## FHIR R4 Compliance
- **Data Serialization**: Anytime patient data (symptoms, history, conditions) is serialized, exported, or passed across API boundaries, the payload MUST strictly conform to the **FHIR R4 Bundle** standard.
- **Sanitization**: All incoming/outgoing string data must be sanitized using DOMPurify before being stored or rendered to ensure HIPAA-compatible privacy and security.
