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

To maintain code quality and security, all contributions must meet the following criteria:

### Code style & Conventions
We enforce strict style standards depending on the service or component:

*   **Frontend (Angular 22)**:
    *   Always use Angular Signals (`computed`, `signal`, `effect`) instead of RxJS observables for local component state.
    *   Use Standalone Components. Do not use `NgModules`.
    *   Prefix interfaces with `I`.
    *   Prefer Tailwind utility classes for all styling.
    *   Use `camelCase` for variables and functions, and `PascalCase` for classes and components.
*   **Backend & Python sidecar (`pocketgull_api`)**:
    *   Use strictly typed Pydantic models for all request and response payloads.
    *   All route handlers and I/O-bound functions must use `async`/`await`.
    *   Format python code using `black` and `ruff` (adhering to PEP-8).
*   **Mobile (Flutter/Dart)**:
    *   Use **Riverpod** for state management. Avoid inline state manipulation for complex logic.
    *   Maintain strict null safety.

### Verification and Checks
Before submitting your Pull Request, ensure that:
1.  **TypeScript & Linting**: Run the TypeScript compiler check to verify types:
    ```bash
    npm run lint
    ```
2.  **Testing**: Run the entire automated test suite (including Vitest and Python unit tests):
    ```bash
    npm test
    ```
3.  **Security**: Ensure your dependencies do not introduce vulnerabilities and that no credentials or keys are checked in.
