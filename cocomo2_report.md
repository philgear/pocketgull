# 📊 COCOMO II Software Cost & Effort Estimation Report

**Generated**: 7/23/2026, 8:40:54 PM
**Target System**: Pocket Gull Medical Intelligence Monorepo

## 1. Codebase Size & Language Metrics

| Language / Layer | Files | Source Lines (SLOC) | KSLOC |
| :--- | :--- | :--- | :--- |
| **TypeScript (Angular Core Web)** | 314 | 87,218 | 87.22 |
| **Dart (Flutter Mobile Suite)** | 156 | 27,427 | 27.43 |
| **Python (FastAPI Sidecar & ML)** | 25 | 4,077 | 4.08 |
| **CSS / Styling System** | 9 | 5,926 | 5.93 |
| **JSON & YAML Manifests** | 138 | 166,328 | 166.33 |
| **Markdown Documentation** | 64 | 5,628 | 5.63 |
| **TOTAL MONOREPO** | **706** | **296,604** | **296.60 KSLOC** |

## 2. COCOMO II Post-Architecture Model Output

| Metric | COCOMO II Estimation |
| :--- | :--- |
| **Effort Estimate** | **997.13 Person-Months** |
| **Estimated Development Time (TDEV)** | **28.69 Months** |
| **Average Full-Time Staffing** | **34.8 Engineers** |
| **Estimated Project Cost** | **$14,956,889 USD** ($15k/month rate) |

## 3. Scale Factors & Effort Multipliers (EAF)

- **PREC (Precedentedness)**: High (1.24) — Proven clinical & 3D WebGL paradigms.
- **FLEX (Development Flexibility)**: High (2.03) — Flexible open API & modular standalone component design.
- **RESL (Architecture / Risk Resolution)**: Extra High (1.41) — Automated CodeQL, FHIR validation, & unit tests.
- **TEAM (Team Cohesion)**: Very High (1.10) — Single/pair pair programming.
- **PMAT (Process Maturity)**: High (3.12) — CI/CD actions & shift-left pre-commit checks.
- **Effort Multiplier (EAF)**: 1.15 (Nominal/High clinical reliability requirement).
