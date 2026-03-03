# Understory

> Insight beneath the surface.

![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)
![Angular](https://img.shields.io/badge/Angular-v21.1-DD0031?logo=angular)
![Three.js](https://img.shields.io/badge/Three.js-v0.183-000000?logo=three.js)
![Lighthouse 100](https://img.shields.io/badge/Lighthouse-100-brightgreen?logo=lighthouse)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-0.1.0-blue)

> **Note:** This application was created for the purposes of entering the Gemini Live Agent Challenge hackathon.
> **Category:** Live Agents 🗣️ (Real-time Interaction Voice & Visual UI)

![Understory Dashboard](docs/images/understory_dashboard.png)

Understory streamlines patient intake with an interactive 3D body map and AI-powered clinical intelligence. It empowers practitioners with rapid data visualization and strategy synthesis for proactive care decisions, acting as an interruptible voice-first clinical co-pilot.

**#GeminiLiveAgentChallenge**

---

## 📃 Text Description

**What it does:**
Understory is a next-generation "Live Agent" orchestrator. By combining real-time human-in-the-loop web speech interaction with a diagnostic 3D surface model and Gemini's deep reasoning (`gemini-2.5-flash` natively and via `@google/adk`), it processes a patient's multimodal symptom data to instantly produce synthesized, actionable clinical strategies. 

**Core Features:**
- **Live AI Consult & Multi-Agent Orchestration:** Powered by `@google/adk` and the Web Speech API. Specialized `LlmAgent` experts synthesize clinical data into actionable insights through an interruptible, natural conversational UI.
- **Care Plan Recommendation Engine:** Synthesizes structured strategies for patient care (Overview, Interventions, Monitoring, Education).
- **Printable Clinical Stationery:** CSS Grid-optimized, multi-page physical printouts featuring Halftone body maps for visual pain hotspot diagnosis.
- **Minimalist Dieter Rams Design:** A premium, minimalist UI prioritizing clarity, neutrality, functional excellence, and seamless mobile responsive layouts (`100dvh`).
- **Interactive 3D Body Mapping:** Precise anatomical selection using a Three.js-powered skeletal and surface model for localized clinical notation.
- **Interactive Task Bracketing:** Rapidly markup generated care plans using a double-click state machine to vet and customize AI recommendations.
- **FHIR-Standard Data Portability & Localized Auto-Save:** Real-time persistence within the client session exported seamlessly via Unicode-safe Base64 encoded FHIR Bundles.

**Technologies Used:**
- **Framework:** Angular v21.1 (Signals-based, Zoneless), Server-Side Rendering (SSR) & Client-Side Hydration
- **Visualization:** Three.js (3D Anatomical Modeling)
- **Intelligence:** Google GenAI SDK (`gemini-2.5-flash`) & Google Agent Development Kit (`@google/adk`)
- **Research Integrations:** Google Programmable Search Engine (CSE) & NIH PubMed E-utilities
- **Export Engine:** jsPDF & FHIR Bundle standard
- **Deployment & Infrastructure:** Google Cloud Run, Express.js Backend

**Data Sources:**
Primary inputs consist of manual demographics, biometric body map interaction, and voice-to-text dictation. Auxiliary real-time clinical context is gathered securely without persistent DB tracking using Google Programmable Search Engine API and NCBI PubMed E-utilities XML parsing algorithms. Patient state data is strictly locally persisted between active sessions.

**Findings and Learnings:**
Reflecting on the development of Understory, my commitment is to continuously embrace the complexity of multi-agent architectures and rigorous frontend performance optimization. Building this platform taught me the profound importance of balancing bleeding-edge AI orchestration—like implementing `@google/adk`'s `InMemoryRunner` to stabilize clinical generations—with the strict UX demands of a modern progressive web app. Ensuring top-tier mobile performance (100/100 Lighthouse) without sacrificing complex 3D integration required deep architectural planning around WebGL lifecycles and early asynchronous chunk loading.

---

## 👨‍💻 Public Code Repository & Spin-Up Instructions

**Developer Profile:** [g.dev/philgear](https://g.dev/philgear)  
**Repository:** [github.com/philgear/understory](https://github.com/philgear/understory)

To run this project in a local development environment:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/philgear/understory.git
    cd understory
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

Understory's backend service and Express proxy layer is architecturally designed to deploy directly to **Google Cloud Run**.

- **Proof of Action:** Successfully deployed to Google Cloud Run! The live application is available at: [https://understory-live-agent-315235665910.us-west1.run.app](https://understory-live-agent-315235665910.us-west1.run.app)
- **Repository Proof:** See `./server.js` and `./src/services/clinical-intelligence.service.ts` for Google Cloud infrastructure integrations calling out to Vertex AI and other services.

---

## 🏗️ Architecture Diagram

The application leverages a modern, reactive architecture utilizing Angular Signals, Cloud Run orchestration, and the Google GenAI API stack. *(Note: This conceptual map is available in high resolution within the hackathon image carousel).*

```mermaid
graph TD
    User[Doctor/User] -->|HTTPS| CloudRun[Google Cloud Run Hosting]
    CloudRun -->|Serves| UI[Angular Frontend]
    CloudRun -->|Hosts| Backend[Express.js Server]
    
    subgraph "Clinical Data Layer"
        UI -->|Selects Body Part| BodyMap[BodyViewer Component]
        UI -->|Enters Data| Intake[IntakeForm Component]
        UI -->|Requests Analysis| Analysis[Analysis Component]
        UI -->|Dictates Notes| Dictation[Dictation Service]
        
        BodyMap -->|Updates| State[PatientState Service]
        Intake -->|Updates| State
        Dictation -->|Updates| Intake
        
        State -->|Uses Centralized Types| Types[patient.types.ts]
        Analysis -->|Reads| State
        Analysis -->|Invokes| AdkRunner[ADK InMemoryRunner]
    end

    subgraph "Persistence & Portability"
        State -->|Persists| PM[Patient Management]
        PM -->|Exports/Imports| FHIR[FHIR Bundle / PDF]
    end
    
    subgraph "AI Core & Integrations"
        AdkRunner -->|Orchestrates| Agents[Specialized LlmAgents]
        Agents -->|Generate Content| Flash[Gemini 2.5 Flash]
        Backend -->|Proxy Request| PubMedProxy[/api/pubmed Endpoint]
        Backend -->|Static Serve| GoogleSearch[search.html]
        PubMedProxy -->|E-utilities API| NCBI[NCBI PubMed]
        GoogleSearch -->|CSE API| Google[Google Programmable Search]
    end
    
    UI -->|Iframe Message| GoogleSearch
    UI -->|API Call| PubMedProxy
    Flash -->|Returns Partial JSON| Agents
    Agents -->|Streams JSON| AdkRunner
    AdkRunner -->|Yields Chunks| Analysis
    NCBI -->|XML to JSON| PubMedProxy
    PubMedProxy -->|Search Results| UI
    Google -->|Search Results| GoogleSearch
    GoogleSearch -->|postMessage| UI
```

---

## 📹 Demonstration Video

---

## 🎉 Bonus Content 

- **Automated Cloud Deployment:** Cloud deployment provisioning has been scripted through Google Cloud's CLI (`gcloud`). See the automated deployment script located at [`./scripts/deploy.sh`](scripts/deploy.sh) within the codebase.


---

## License

This project is licensed under the MIT License.