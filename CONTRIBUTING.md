# Contributing to Skimble

Thanks for your interest in improving Skimble! This guide explains how to set up the project, propose changes through a fork, and what to check **before opening an issue**. Following it keeps things smooth for everyone.

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

## Table of Contents

1. [Before You Open an Issue](#before-you-open-an-issue)
2. [How to Report a Bug](#how-to-report-a-bug)
3. [How to Suggest a Feature](#how-to-suggest-a-feature)
4. [Contributing Code (Fork & Pull Request)](#contributing-code-fork--pull-request)
5. [Local Development Setup](#local-development-setup)
6. [Coding Guidelines](#coding-guidelines)
7. [Commit & Pull Request Conventions](#commit--pull-request-conventions)

---

## Before You Open an Issue

Please run through this checklist first — most questions are answered here, and it prevents duplicate reports:

- [ ] **Search existing issues** (open *and* closed) to confirm it hasn't already been reported or resolved.
- [ ] **Check the [README](README.md)** — especially *Getting Started*, *Environment Variables*, and *API Reference*.
- [ ] **Verify your setup** — you are on **Node.js 20+**, ran `npm install` in **both** `frontend/` and `backend/`, and created valid `.env` files.
- [ ] **Confirm it's not a config problem** — missing/incorrect Cognito or AWS credentials cause most "it won't start / I can't log in" errors. Check the backend console for startup errors.
- [ ] **Reproduce on the latest `main`** — pull the newest changes and try again.
- [ ] **Isolate the layer** — is the problem in the frontend, the backend API, or the Socket.IO realtime flow? Check the browser console *and* the backend logs.

If you've done all of the above and the problem persists, please open an issue.

> ⚠️ **Never include secrets** (AWS keys, Cognito client secrets, JWTs, `.env` contents) in an issue. Redact them from logs and screenshots.

---

## How to Report a Bug

Open a **Bug report** issue and include:

- A clear, descriptive **title**.
- **Steps to reproduce** (numbered).
- **Expected** vs. **actual** behavior.
- **Environment**: OS, browser, Node.js version.
- **Evidence**: relevant console/network logs, screenshots, or a short screen recording (secrets redacted).
- Whether it's reproducible **consistently** or **intermittently**.

## How to Suggest a Feature

Open a **Feature request** issue and describe:

- The **problem** you're trying to solve (the "why", not just the "what").
- Your **proposed solution** and any alternatives you considered.
- How it fits Skimble's scope (see the *Roadmap* in the README).

---

## Contributing Code (Fork & Pull Request)

Skimble uses the standard **fork → branch → pull request** workflow. You don't need write access to the main repository.

### 1. Fork the repository

Click the **Fork** button at the top-right of the [repository page](https://github.com/hari-dev-003/Notespace). This creates a copy under your own GitHub account.

### 2. Clone your fork

```bash
git clone https://github.com/<your-username>/Notespace.git
cd Notespace
```

### 3. Add the original repo as `upstream`

This lets you keep your fork in sync with the project.

```bash
git remote add upstream https://github.com/hari-dev-003/Notespace.git
git remote -v   # verify: origin = your fork, upstream = original
```

### 4. Create a branch

Never commit directly to `main`. Create a descriptive branch:

```bash
git checkout -b feat/short-description      # for features
# or
git checkout -b fix/short-description       # for bug fixes
```

### 5. Make your changes

Set up your environment (see [Local Development Setup](#local-development-setup)), then implement your change. Keep it focused — one logical change per pull request.

### 6. Test and lint before committing

```bash
cd frontend
npm run lint
npm run test
npm run build     # make sure the production build still succeeds
```

### 7. Commit and push to your fork

```bash
git add .
git commit -m "feat: add ..."
git push origin feat/short-description
```

### 8. Keep your branch up to date (if needed)

```bash
git fetch upstream
git rebase upstream/main
```

### 9. Open a Pull Request

Go to your fork on GitHub and click **Compare & pull request**. Target the original repo's `main` branch. Fill in the description (see [PR Conventions](#commit--pull-request-conventions)) and link any related issue (e.g. `Closes #123`).

---

## Local Development Setup

Full instructions live in the [README](README.md#getting-started). In short:

```bash
# Backend
cd backend && npm install && npm run dev      # http://localhost:3000

# Frontend (in a second terminal)
cd frontend && npm install && npm run dev     # http://localhost:5173
```

You'll need valid `backend/.env` and `frontend/.env` files — see [Environment Variables](README.md#environment-variables). AWS Cognito and DynamoDB access are required for auth and persistence to work.

---

## Coding Guidelines

- **Match the existing style** — the frontend uses ESLint; run `npm run lint` and fix warnings you introduce.
- **Keep changes scoped** — avoid unrelated refactors in the same PR.
- **Frontend**: functional React components and hooks; style with Tailwind utility classes (theme tokens like `sk-accent`, `sk-1`, etc.). Reuse existing components (e.g. `<Logo />`) rather than duplicating markup.
- **Backend**: keep route → controller → model separation. Protected routes go through the `verifyToken` middleware.
- **Don't commit** `node_modules/`, `.env`, build output, or generated assets that aren't part of your change.

---

## Commit & Pull Request Conventions

**Commits** — use clear, [Conventional Commit](https://www.conventionalcommits.org/)-style prefixes:

| Prefix | Use for |
|--------|---------|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `style:` | Formatting / non-logic changes |
| `test:` | Adding or updating tests |
| `chore:` | Tooling, deps, config |

**Pull requests** should:

- Have a descriptive title and a summary of **what** changed and **why**.
- Link the related issue (`Closes #123`).
- Include screenshots or clips for UI changes.
- Pass lint, tests, and build.
- Stay focused on a single concern.

---

Thank you for helping make Skimble better! 🎨
