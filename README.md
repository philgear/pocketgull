# 🕊️ POCKET GULL
**Aerial Perspective for the Clinical Ocean**

---

### PREPARED FOR
**Google Gemini Live Agent Challenge** / Hackathon 2026

### CATEGORY
**Live Agents 🗣️** (Multimodal Synthesis & Agent Orchestration)

### VISION
*"To provide practitioners with the 'Gull's Eye View'—the ability to rise above the turbulent sea of medical data and see the clear, actionable patterns beneath."*

---

## 📋 THE STORY OF THE SEAGULL

In modern medicine, practitioners are often drowning in a "Sea of Information"—fragmented vitals, sprawling patient histories, and an ever-shifting tide of clinical literature. **Pocket Gull** was conceived as an aerial navigator. 

Like its namesake, the agent is **agile**, **interruptible**, and **highly observant**. It doesn't just process data; it provides **Uplift**. By synthesizing multimodal inputs (3D spatial data, voice dictation, and biometric telemetry) into a singular, high-integrity strategy, it allows the clinician to maintain perspective without losing sight of the patient.

> **Industrial Grace:** We believe medical tools should be as beautiful as they are functional. Our design language combines the clinical precision of a laboratory with the "Less, but better" philosophy of Dieter Rams.

![Pocket Gull Dashboard](./docs/images/pocket-gull_dashboard.png)

---

## 🛠️ SCIENTIFIC RIGOR & CORE CAPABILITIES

#### 🧠 EVIDENCE-GROUNDED REASONING (EGR)
Pocket Gull eliminates "Black Box" AI anxiety. Every recommendation is anchored by an **Evidence Trail** generated through real-time integration with **Google Programmable Search** and **NCBI PubMed**. The agent doesn't just suggest; it cites.

#### 🎙️ MULTIMODAL SYNTHESIS & ORCHESTRATION
Powered by `@google/adk` and the Web Speech API. Specialized `LlmAgent` experts operate in a "InMemoryRunner" environment, maintaining **context-aware memory** of report nodes, allowing for fluid, multi-turn reasoning across voice and visual UI.

#### 📐 PRECISION 3D ANATOMICAL MODELING
Using Three.js, we provide a procedurally detailed skeletal and surface model. Severity is visualized through dynamic particle systems, translating abstract pain descriptions into **spatial clinical data**.

#### 📄 COGNITIVE LOCALIZATION (COLO)
Moving beyond simple translation, the **COLO Engine** adjusts the "Clinical Strategy" to the patient's cognitive state (Standard, Dyslexia-Friendly, Pediatric) without losing clinical accuracy, ensuring **Informed Consent** is truly inclusive.

---

## 🧩 TECHNICAL ARCHITECTURE

A highly interactive, aesthetically minimal user interface (Industrial Grace) designed for immediate clinical insight.
*For a full demonstration, press the `Demo` button in the top-right of the application to load the patient simulation.*

### Product Highlights

![Dashboard Snapshot](./docs/images/dashboard.png)

![3D Body Viewer](./docs/images/body_viewer.png)

![Inline Agent Chat](./docs/images/inline_chat.webp)

---

## 📃 Text Description

**What it does:**
Pocket Gull is a next-generation "Live Agent" orchestrator. By combining real-time human-in-the-loop web speech interaction with a diagnostic 3D surface model and Gemini's deep reasoning (`gemini-2.5-flash` natively and via `@google/adk`), it processes a patient's multimodal symptom data to instantly produce synthesized, actionable clinical strategies.

**Core Features:**
- **Live AI Consult & Multi-Agent Orchestration:** Powered by `@google/adk` and the Web Speech API. Specialized `LlmAgent` experts synthesize clinical data into actionable insights through an interruptible, natural conversational UI with **context-aware memory** of recently discussed report nodes.
- **Care Plan Recommendation Engine:** A professional clinical analysis engine that synthesizes structured strategies for patient care, organized by diagnostic lenses (Overview, Interventions, Monitoring, Education). Includes **inline agent queries** directly from generated report nodes.
- **Cognition & Child Export Modes:** Seamlessly translate Care Plans into dyslexia-friendly or pediatric formats, outputted to PDF using refined Dieter Rams 'carousel informatics' typography.
- **Printable Clinical Stationery:** CSS Grid-optimized, multi-page physical printouts featuring Halftone body maps for visual pain hotspot diagnosis, with user-selectable toggles for clinical summaries and history.
- **Minimalist Dieter Rams Design:** A premium, minimalist UI prioritizing clarity, neutrality, functional excellence, and seamless mobile responsive layouts (`100dvh`). Includes dark-mode agent conversations.
- **Detailed 3D Medical Imagery:** Precise anatomical selection using a Three.js-powered skeletal and surface model (including detailed procedural spine geometry) with dynamic particle systems highlighting diagnostic severity.
- **Smartwatch & Mobile Optimization:** Responsive Two-Column Grid UI scaling down to extremely constrained viewports (e.g., Pixel Watch 2 at 286px width) for ultra-portable clinical referencing.
- **Scans & Diagnostics Library:** Integrated visual gallery within the patient profile for organizing and analyzing medical imagery (e.g., MRI, X-Rays), complete with dynamic Wikimedia Commons linking.
- **Evidence Focus Iconography:** Custom medical iconography enhancing the interactive Task Bracketing and inline chat systems.
- **Box Breathing UX:** Focused 16-second box breathing visual animations integrated into primary intake text areas to promote practitioner mindfulness.
- **Interactive Task Bracketing:** Rapidly markup generated care plans using a double-click state machine (Normal, Added, Removed) to vet and customize AI recommendations.
- **FHIR-Standard Data Portability & Localized Auto-Save:** Real-time persistence with visual "Saving..." / "Saved ✔" indicators, exported via Unicode-safe Base64 encoded FHIR Bundles.
- **Patient Management System:** Full CRUD capabilities for patient records, including historical visit review and permanent record removal.

**Technologies Used:**
- **Framework:** Angular v21.1 (Signals-based, Zoneless), Server-Side Rendering (SSR) & Client-Side Hydration
- **Visualization:** Three.js (3D Anatomical Modeling)
- **Intelligence:** Google GenAI SDK (`gemini-2.5-flash`) & Google Agent Development Kit (`@google/adk`)
- **Research Integrations:** Google Programmable Search Engine (CSE) & NIH PubMed E-utilities
- **Export Engine:** jsPDF & FHIR Bundle standard
- **Styling:** Tailwind CSS & Dieter Rams Design System
- **Speech Control:** Web Speech API (Bi-directional voice interaction)
- **Deployment & Infrastructure:** Google Cloud Run, Express.js Backend

**Data Sources:**
Primary inputs consist of manual demographics, biometric body map interaction, and voice-to-text dictation. Auxiliary real-time clinical context is gathered securely without persistent DB tracking using Google Programmable Search Engine API and NCBI PubMed E-utilities XML parsing algorithms. Patient state data is strictly locally persisted between active sessions.

**Findings and Learnings:**
Reflecting on the development of Pocket Gull, my commitment is to continuously embrace the complexity of multi-agent architectures and rigorous frontend performance optimization. Building this platform taught me the profound importance of balancing bleeding-edge AI orchestration—like implementing `@google/adk`'s `InMemoryRunner` to stabilize clinical generations—with the strict UX demands of a modern progressive web application. I commit to changing how I approach state management in future projects by prioritizing granular, reactive UI signals from day one, and to never settle for "good enough" when a top-tier mobile performance score (100/100 Lighthouse) is attainable through diligent layout unblocking and dynamic asset loading. Further, this project deepened my respect for CSS—from mastering viewport units (`100dvh`) to restore native scrolling on complex mobile constraints, to implementing robust `@media print` rules for structured offline clinical stationery.

---

## 📚 Documentation

Full engineering documentation is available in the [`docs/study/`](./docs/study/) directory, built with [Astro](https://astro.build).

- **[Overview](./docs/study/src/pages/index.astro)** — Product introduction, screenshots, and key metrics
- **[Architecture](./docs/study/src/pages/architecture.mdx)** — System diagram, data flow, and technology stack
- **[Features](./docs/study/src/pages/features.mdx)** — Complete feature reference by category
- **[Data & Privacy](./docs/study/src/pages/data.mdx)** — Storage model, PHI handling, and FHIR portability
- **[Responsible AI](./docs/study/src/pages/responsible-ai.mdx)** — Core principles and societal impact
- **[Getting Started](./docs/study/src/pages/getting-started.mdx)** — Installation, development, and deployment
- **[Case Study](./docs/case_study.md)** — Professional engineering case study with benchmark results

---

## 👨‍💻 Public Code Repository & Spin-Up Instructions

**Developer Profile:** [g.dev/philgear](https://g.dev/philgear)  
**Repository:** [github.com/philgear/pocket-gull](https://github.com/philgear/pocket-gull)

To run this project in a local development environment:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/philgear/pocket-gull.git
    cd pocket-gull
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Preview Production Build:**
    ```bash
    npm run build
    npm run preview
    ```

---

## 🖥️ Proof of Google Cloud Deployment

Pocket Gull's backend service and Express proxy layer is architecturally designed to deploy directly to **Google Cloud Run**.

- **Proof of Action:** Successfully deployed to Google Cloud Run! The live application is available at: [https://pocketgall.app](https://pocketgall.app) (and [https://understory-315235665910.us-west1.run.app](https://understory-315235665910.us-west1.run.app))
- **Repository Proof:** See `./server.js` and `./src/services/clinical-intelligence.service.ts` for Google Cloud infrastructure integrations.

---

## 🏗️ Architecture Diagram

Built with a **Signals-First (Zoneless)** architecture in Angular v21.1 for 100/100 Lighthouse performance and deterministic state management.
The application leverages a modern, reactive architecture utilizing Angular Signals, Cloud Run orchestration, and the Google GenAI API stack. *(Note: This conceptual map is available in high resolution within the hackathon image carousel.)*

```mermaid
graph TD
    User[Practitioner] -->|Multimodal Input| UI[Pocket Gull UI]
    UI -->|Signals-First State| State[PatientState Service]
    
    subgraph "INTELLIGENCE LAYER"
        State -->|Context Injection| Adk[ADK InMemoryRunner]
        Adk -->|Orchestrates| Agents[Specialized Agents]
        Agents -->|REST/SSE| Gemini[Gemini 2.5 Flash]
    end

    subgraph "EVIDENCE FOUNDATION"
        Adk -->|Parallel Query| PubMed[NCBI PubMed E-Utilities]
        Adk -->|Semantic Search| GSearch[Google Search API]
        PubMed -->|Citations| UI
        GSearch -->|Evidence Trail| UI
    end

    subgraph "OUTPUT & EXPORT"
        UI -->|COLO Engine| Translation[Cognitive Adaptation]
        Translation -->|Dieter Rams Style| PDF[Clinical Stationary PDF]
        State -->|Standardization| FHIR[FHIR Bundle JSON]
    end
```

---

## 🚀 INFRASTRUCTURE & DEPLOYMENT

#### 1. REPRODUCIBILITY
```bash
git clone https://github.com/philgear/pocket-gull.git
npm install
npm run dev
```

#### 2. CLOUD ORCHESTRATION
The project is built for **Google Cloud Run**. Our `deploy.sh` script automates the build-and-release pipeline, including Google Cloud Secret Manager integration for `GEMINI_API_KEY`.

---

## 📜 RESPONSIBLE AI & ETHICS

Pocket Gull adheres to the **Human-in-the-Loop** (HITL) principle. 
- **Task Bracketing:** Clinicians must manually "bracket" (validate/edit) AI suggestions before they are archived.
- **Explainability:** The agent surfaces its reasoning lens (Intervention, Monitoring, Education) for every output.
- **Privacy Core:** Zero PII persistence. All patient state is transient or locally-stored.

---

## 👨‍💻 THE CRAFT
**Phil Gear** / [g.dev/philgear](https://g.dev/philgear)  
Engineering with **Kaizen**—the belief that clinical excellence is a journey of continuous refinement.

---

*© 2026 Pocket Gull. Industrial Grace & Clinical Intelligence.*
*© 2026 Pocket Gull. Licensed under MIT.*