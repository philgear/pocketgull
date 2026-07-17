# Contributing to Pocketgull

Thank you for your interest in contributing to Pocketgull! This document outlines the guidelines and procedures for obtaining the software, reporting bugs, suggesting enhancements, and contributing code.

By participating in this project, you agree to abide by our security standards and code of conduct.

---

## 1. How to Obtain the Software

Pocketgull is an open-source project hosted on GitHub. You can obtain the code by cloning the repository:

```bash
git clone https://github.com/philgear/pocketgull.git
cd pocketgull
```

Refer to the [Getting Started Guide](file:///c:/Users/philg/Pocketgull/pocketgull/docs/study/src/pages/getting-started.mdx) for detailed installation and local execution instructions.

---

## 2. Providing Feedback (Bugs and Enhancements)

We use **GitHub Issues** to track bugs, enhancements, and tasks. 

*   **Reporting Bugs**: If you find a bug, please open an issue in the [Pocketgull Issue Tracker](https://github.com/philgear/pocketgull/issues). Provide a clear description of the issue, steps to reproduce it, and any error logs or screenshots.
*   **Enhancement Requests**: If you have an idea for a new feature or improvement, feel free to open a feature request issue describing the use case and proposed solution.

---

## 3. Contribution and Pull Request Process

We welcome code contributions via Pull Requests (PRs). To contribute:

1.  **Fork the Repository**: Create a personal fork of the repository on GitHub.
2.  **Create a Branch**: Create a feature branch for your changes (e.g., `git checkout -b feat/my-new-feature` or `git checkout -b fix/issue-id`).
3.  **Implement Changes**: Write your code, adhering to our coding standards.
4.  **Verify Code**: Ensure all local tests and linting checks pass (see verification below).
5.  **Submit a Pull Request**: Submit a Pull Request from your branch to our default branch (`main` or current release branch) on the [Pocketgull Pull Requests page](https://github.com/philgear/pocketgull/pulls).
6.  **Review**: A maintainer will review your PR and may request changes before merging.

---

## 4. Requirements for Acceptable Contributions

To maintain code quality, HIPAA compliance, and security, all contributions must meet the following criteria:

### Code Style & Conventions
We enforce strict style standards depending on the service or component:

*   **Frontend (Angular 22)**:
    *   Always use Angular Signals (`computed`, `signal`, `effect`) instead of RxJS observables for local component state.
    *   Use Standalone Components. Do not use `NgModules`.
    *   Prefix interfaces with `I` (e.g., `IPatientRecord`).
    *   Prefer Tailwind utility classes for all styling.
    *   Use `camelCase` for variables and functions, and `PascalCase` for classes and components.
*   **Backend & Python Sidecar (`pocketgull_api`)**:
    *   Use strictly typed Pydantic models for all request and response payloads.
    *   All route handlers and I/O-bound functions must use `async`/`await`.
    *   Format python code using `black` and `ruff` (adhering to PEP-8).
*   **Mobile (Flutter/Dart)**:
    *   Use **Riverpod** for state management. Avoid inline state manipulation for complex logic.
    *   Maintain strict null safety.

### Automated Testing Requirements
*   **Regression Tests**: Every bug fix MUST include a corresponding regression unit test verifying the fix.
*   **Feature Coverage**: New features or services MUST include unit or integration tests verifying behavior under normal and edge conditions.
*   **Run Suite Locally**: Ensure all tests pass before making a PR:
    ```bash
    npm test
    ```

### Documentation & Explanations
*   **In-Code Comments**: Code must be self-documenting. Use TSDoc/JSDoc block comments for classes, interfaces, and public methods. Suffix observable streams (where applicable) with `$`.
*   **Astro Study Docs**: If your changes alter the application's architecture, APIs, or user features, you must update the corresponding page in the Astro docs directory (`docs/study/src/pages/`).

### Security & Privacy Compliance (HIPAA)
*   **PII & PHI Redaction**: Never write Patient Health Information (PHI) or Personally Identifiable Information (PII) to server logs, CI reports, or standard database tables. All transient clinical state must reside locally in the Signals-based `PatientStateService`.
*   **Input Sanitization**: Any external user input must be sanitized via DOMPurify before being saved or rendered in the DOM to mitigate Cross-Site Scripting (XSS).
*   **No Hardcoded Secrets**: Do not commit API keys, service account credentials, or configuration files containing private strings. All keys must be resolved dynamically through environment variables or secure vault parameters in GitHub Actions and Google Secret Manager.

### Commit Message Conventions
We follow the **Conventional Commits** specification. Commit summaries must use the format `<type>(<scope>): <description>`:
*   `feat`: A new user-facing feature.
*   `fix`: A bug resolution.
*   `docs`: Documentation updates.
*   `test`: Adding or correcting tests.
*   `security`: Security-hardening commits (e.g., patching dependencies or CodeQL findings).
*   `chore`: Regular maintenance tasks.

### Semantic Versioning (SemVer)
This project follows Semantic Versioning (`MAJOR.MINOR.PATCH`) rules:
*   **MAJOR**: Incremented when you make incompatible API changes,
*   **MINOR**: Incremented when you add functionality in a backwards-compatible manner, and
*   **PATCH**: Incremented when you make backwards-compatible bug fixes.

---

### Verification and Checks
Before submitting your Pull Request, verify:
1.  **TypeScript Compilation**: Run the compiler check:
    ```bash
    npm run lint
    ```
2.  **Husky Hooks**: Ensure your local commit triggers the pre-commit script successfully.

