# Pocket Gull Agentic Instructions

This document provides guidance for AI agents working on the Pocket Gull project.

## Technical Stack
- **Framework**: Angular v21.2 (Signals-based, Standalone Components, SSR)
- **Styling**: Tailwind CSS (Vanilla CSS where needed).
- **Architecture**: Service-oriented with `PatientStateService` as the source of truth.
- **Components**: Functional-style standalone components.
- **3D Viewer**: Three.js v0.183+ — use `THREE.Timer` (not deprecated `THREE.Clock`) for elapsed time tracking.
- **AI**: Gemini 2.5 Flash via `@google/adk`, `@google/genai`, and Genkit.

## Development Workflows
- Always verify UI changes using the `browser_subagent`.
- Use `afterNextRender` for DOM-dependent signal initializations.
- Follow the **Industrial Grace** design standard: premium, obsidian-and-slate palette, obsidian glass effects.
- **Minimalist Dieter Rams Design Mandate**: All UI updates must prioritize a premium, minimalist design with clarity, neutrality, and functional excellence.
- **Mobile Responsiveness**: Enforce seamless mobile responsive layouts using `100dvh` to ensure perfect fit on mobile devices (e.g., Pixel Watch, smartphones). Avoid hardcoded pixel heights where `100dvh` and CSS grid/flexbox provide better responsive scaling.

## Local Environment & Secrets
- **No `.env.local` required in Angular root**: `fetchGeminiApiKey()` in `src/server.ts` automatically falls back to `pocketgull_api/.env` and `pocketgull_api/.env.local`. Add `GEMINI_API_KEY=<key>` to either file for local dev/preview.
- **Run locally**: `npm run dev` (dev server) or `npm run preview` (production build + SSR server on port 4200).
- **Access via `localhost:4200`**, not `0.0.0.0:4200` — browsers enforce COOP/COEP headers only on trusted origins (`localhost` qualifies; `0.0.0.0` does not).

## Layout System
The layout is managed in `AppComponent` with a multi-directional resizable grid:
- **Vertical Split**: Medical Chart vs. Analysis/Intake.
- **Horizontal Split**: Main Workspace vs. Medical Summary (Care Plan Engine).
- **Signals**: `inputPanelWidth` and `topSectionHeight`.

## Known Third-Party Restrictions
- **OHIF Viewer (`viewer.ohif.org`)**: Sets `X-Frame-Options: DENY` — cannot be embedded in an `<iframe>`. Use a launch card that opens it in a new tab with `StudyInstanceUIDs` deep-link.
- **DICOM API**: Requires `HC_DATASET` + `HC_DICOM_STORE` env vars. Returns 400 locally without them — expected behavior.

## MCP Tool Integration
For complex tasks, leverage the following MCP servers:
- **`firebase-mcp-server`**: For database queries, Firestore reads/writes, security rules validation, and Cloud Storage management.
- **`github-mcp-server`**: For PR reviews, issue tracking, branch management, and repository automation.
- **`google-maps-platform-code-assist`**: For all location-based logic, routing, and map rendering optimization.

> To add or modify MCP servers, update the relevant MCP config file (e.g., `.cursor/mcp.json`, `claude_desktop_config.json`, or the IDE-specific config) and restart the AI client.

## Verification Patterns
Use the following checks when verifying work:
1. **Resizer Integrity**: Ensure dragging both column and row resizers is smooth and snapping works.
2. **State Sync**: Verify that selections in the 3D viewer correctly update `selectedPartId` and trigger relevant UI transitions.
3. **Responsive Flow**: Check how panels behave when collapsed or maximized.
4. **Build Cleanliness**: Run `npm run build` — zero errors expected, `sourceMap: false` in production suppresses Angular's `init.mjs.map` warnings.

