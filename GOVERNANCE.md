# 🏛️ POCKET GULL PROJECT GOVERNANCE

## 1. Governance Model
Pocket Gull is an open-source clinical technology project operating under a **Benevolent Dictator / Lead Maintainer** governance model with community advisory participation:
- **Lead Maintainer**: Phil Gear ([@philgear](https://github.com/philgear)) leads technical direction, architecture decisions, release tags, and clinical engineering standards.
- **Maintainers & Contributors**: Code reviews, pull request approvals, and issue triage are performed collaboratively adhering to OpenSSF Best Practices and clinical engineering guidelines.

---

## 2. Roles and Responsibilities
- **Lead Maintainer (`@philgear`)**:
  - Sets overall vision, core architecture, and security policies.
  - Manages GitHub repository settings, Cloud Run deployments, and security key material.
  - Reviews and merges all pull requests adhering to strict pre-commit validation.
- **Contributors**:
  - Submit issues, bug reports, and pull requests following [CONTRIBUTING.md](https://github.com/philgear/pocketgull/blob/main/CONTRIBUTING.md).
  - Ensure 100% strict compliance with HIPAA PII/PHI sanitization and automated unit testing rules.

---

## 3. Access Continuity & Bus Factor
- **Repository Continuity**: Key credentials, deployment configurations, and project metadata are stored in standard Google Cloud (`gen-lang-client-0540208645`) and GitHub administrative settings.
- **Emergency Access**: Designated emergency backup maintainer access keys are maintained to ensure minimal interruption (< 1 week) in the event of maintainer unavailability.
- **Bus Factor**: The project enforces automated CI/CD pipelines, full SHA dependency pinning, and comprehensive documentation (`README.md`, `SECURITY.md`, `GOVERNANCE.md`) allowing any qualified engineer to build, test, and deploy the application.
