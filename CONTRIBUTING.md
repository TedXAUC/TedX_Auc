# Contributing to TEDx AUC

Thank you for your interest in contributing to the TEDx AUC platform. To maintain engineering rigor and code quality, please adhere to the guidelines below.

---

## Code of Conduct

All contributors and maintainers are expected to maintain professional, constructive, and respectful communication.

---

## Development Workflow

1. **Fork & Branch**:
   - Fork the repository to your GitHub account.
   - Create a feature branch off `main`:
     ```bash
     git checkout -b feature/your-feature-name
     ```

2. **Local Environment Setup**:
   - Install dependencies:
     ```bash
     npm install
     cd server && npm install && cd ..
     ```
   - Copy `.env.example` to `.env` and fill in necessary Supabase credentials.

3. **Code Style & Quality**:
   - Ensure code is written in strict TypeScript.
   - Run linter and formatting before committing:
     ```bash
     npm run lint
     ```
   - Follow standard React component conventions with Tailwind CSS utility classes and Radix UI primitives.

4. **Commit Guidelines**:
   - Use [Conventional Commits](https://www.conventionalcommits.org/):
     - `feat: add attendee ticket download button`
     - `fix: resolve seat collision on concurrent selections`
     - `docs: update deployment environment variables`
     - `refactor: optimize webhook raw body validation`

5. **Submitting a Pull Request**:
   - Push your branch to your fork.
   - Open a Pull Request targeting `main`.
   - Fill in the PR description template completely, explaining what changed and how you tested it.
