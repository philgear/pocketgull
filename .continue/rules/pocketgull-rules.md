# Pocket-Gull Project Rules and Architecture

This file provides context and rules for Continue's Agent mode to understand the Pocket-Gull workspace.

## Project Overview
Pocket-Gull is a real-time medical Care Plan Strategy and Live AI Consult engine powered by Google Gemini. The application is designed to provide actionable clinical intelligence, manage patient state, and offer real-time streaming AI consultations for symptom management and functional medicine.

## Tech Stack
- **Frontend**: Angular 22 (Standalone Components, Signals)
- **Backend/SSR**: Node.js, Express, Angular Server-Side Rendering
- **AI Integration**: Google Gemini (via native REST, `@google/adk` `InMemoryRunner`, `@google/genai`, and Genkit)
- **Interactive 3D Anatomy**: Three.js for procedural skeletal and surface modeling
- **Voice / Speech**: Web Speech API for bi-directional voice interaction
- **Privacy & Export**: DOMPurify for HIPAA-compatible sanitization, FHIR R4 Bundle standard, jsPDF
- **Companion Apps**: Python FastAPI sidecar (ML scoring), Flutter/Dart (Mobile Suite)
- **Styling**: TailwindCSS

## Environment Requirements
- **Node.js**: Use **Node.js v24.x** strictly.
- **esbuild Override**: Global default override is `0.27.2`. Angular CLI specific override is `0.28.1`.

## Key Architecture Concepts
- **Patient State**: Managed centrally via `PatientStateService`, which holds current symptoms, vitals, and selected conditions.
- **AI Layer**: `ClinicalIntelligenceService`, `GeminiProvider`, and `AdkLiveService` connect to Gemini.
- **Proxy**: Explicit proxy connects WebSocket streams and API routes to the backend during development.

## Developer Instructions & Conventions
- **Angular Signals**: Always favor Angular Signals (`computed`, `signal`, `effect`) over RxJS observables for local component state.
- **Components**: Standalone components are the strict standard. Do not use NgModules.
- **Typing**: Use explicit types for all function returns and state definitions. Prefix interfaces with `I`.
- **AI Streaming**: Chunk streaming responses and manage conversational state defensively.
- **Styling**: Prefer Tailwind utility classes. Do not use generic colors; use the curated color palette.
- **Naming**: Use camelCase for variables/functions, PascalCase for classes/components. Suffix observable streams with `$`.
- **Structure**: Keep components small and focused. Extract heavy logic into injectable services.
- **Documentation**: Provide TSDoc style comments for complex service methods or AI integration points.
