# Pocket-Gull (Understory)

## Project Overview
Pocket-Gull is a real-time medical Care Plan Strategy and Live AI Consult engine powered by Google Gemini. The application is designed to provide actionable clinical intelligence, manage patient state, and offer real-time streaming AI consultations for symptom management and functional medicine.

## Tech Stack
- **Frontend**: Angular 18 (Standalone Components, Signals)
- **Backend/SSR**: Node.js, Express, Angular Server-Side Rendering
- **AI Integration**: Google Gemini (via native REST, `@google/adk`, `@google/genai`, and Genkit)
- **Styling**: TailwindCSS

## Key Architecture Concepts
- **Patient State**: Managed centrally via `PatientStateService`, which holds current symptoms, vitals, and selected conditions.
- **AI Intelligence Layer**: Services (`ClinicalIntelligenceService`, `GeminiProvider`, `AdkLiveService`) handle connecting to Gemini models for one-off completions, multi-turn chat, and full-duplex multimodal live audio streaming.
- **Proxy**: During development, an explicit proxy is used to connect WebSocket streams and API routes to the backend correctly.

## Developer Instructions
- **Signals**: Always favor Angular Signals (`computed`, `signal`, `effect`) over RxJS observables for local component state.
- **Components**: Standalone components are the strict standard. Do not use NgModules.
- **Typing**: Use explicit types for all function returns and state definitions where practical. Prefix interfaces with `I`.
- **AI Streaming**: When generating or managing AI chat flows, chunk streaming responses and manage the conversational state defensively against network interruptions.
- **Styling**: Prefer Tailwind utility classes for all new styling components. Do not use generic colors; use the curated color palette and ensure a rich, premium aesthetic with micro-animations.

## Code Style & Conventions
- **Naming**: Use camelCase for variables and functions, PascalCase for classes and components. Suffix observable streams with `$`.
- **Structure**: Keep components small and focused. Extract heavy logic into injectable services.
- **Documentation**: Provide TSDoc style comments for complex service methods or AI integration points.

## Testing Philosophy
- Wait for explicit user instruction before writing or modifying tests, unless fixing a build error.
- Use the standard Angular testing utilities for any generated tests.

## Deployment & Scripts
- Start the development server using `npm run dev` (this handles both the client and the integrated SSR Express server).
- To verify a build, execute `npm run build`.
- Deployment is to Google Cloud Run via `npm run deploy`.

## Perfect Component Example
```typescript
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-all hover:shadow-md">
      <h3 class="text-sm font-medium text-gray-500">{{ title() }}</h3>
      <div class="mt-2 flex items-baseline gap-2">
        <span class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ displayValue() }}</span>
        @if (trend() > 0) {
          <span class="text-xs font-medium text-green-600">↑ {{ trend() }}%</span>
        }
      </div>
    </div>
  `
})
export class MetricCardComponent {
  title = signal('Patient Heart Rate');
  value = signal(72);
  trend = signal(2.5);

  displayValue = computed(() => \`\${this.value()} bpm\`);
}
```
