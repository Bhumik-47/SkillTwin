# Security Policy

## 1. Purpose
The purpose of this Security Policy is to protect the integrity, privacy, and safety of the **SkillTwin** project and its users. As an open-source student and hackathon project, we are committed to promptly addressing security vulnerabilities while ensuring a secure development environment.

---

## 2. How to Report a Security Vulnerability

If you discover a security vulnerability in SkillTwin, **please report it privately**.

> ⚠️ **Important**: Do **NOT** report vulnerabilities or potential security flaws through public GitHub Issues, Pull Requests, or Discussions.

### Reporting Process:
1. **GitHub Private Vulnerability Reporting**:
   - Go to the **Security** tab of the repository: [https://github.com/Bhumik-47/SkillTwin/security](https://github.com/Bhumik-47/SkillTwin/security)
   - Click on **Report a vulnerability** to privately submit details to the repository maintainers.
2. **Direct Maintainer Contact via GitHub**:
   - If GitHub Private Vulnerability Reporting is unavailable, please contact the repository maintainers privately through GitHub before sharing any sensitive details.

---

## 3. What a Useful Report Should Contain

To help maintainers investigate and resolve the issue quickly, please provide:
- A clear description of the vulnerability and its potential security impact.
- Step-by-step reproduction instructions or a minimal proof of concept (PoC).
- Affected sub-systems or files (e.g., `backend/auth/`, `backend/routers/`, `frontend/src/lib/`, API routes, Gemini agents).
- Any suggested remediation, mitigation, or patch (if available).

---

## 4. Expected Response & Handling Process

- **Acknowledgment**: Repository maintainers will acknowledge receipt of the private report in a timely manner.
- **Investigation**: Maintainers will review, reproduce, and assess the severity of the reported issue.
- **Remediation**: A fix will be developed and tested in a private branch before being merged into `main`.
- **Resolution**: Once the fix is published, maintainers will notify the reporter and update the repository.

---

## 5. Responsible Disclosure Guidance

We ask all security researchers and contributors to practice **responsible disclosure**:
- Give maintainers reasonable time to investigate and fix the vulnerability before disclosing it publicly.
- Do not exploit the vulnerability beyond what is strictly necessary to demonstrate proof of concept.
- Avoid any destructive actions, accessing unauthorized user data, or disrupting the platform.

---

## 6. Strict Warning on Secrets & Credentials

Contributors, users, and reporters must **NEVER publicly disclose, commit, or attach real secrets** in GitHub issues, pull requests, commit messages, or repository discussions.

### Prohibited Items:
- **API Keys** (e.g., Google Gemini `GEMINI_API_KEY`, AI service tokens)
- **JWT Secrets** (`SECRET_KEY`, `JWT_SECRET_KEY`)
- **Passwords and password hashes**
- **Database credentials** or connection strings with authentication parameters
- **Environment files** (`.env`, `.env.local`, `.env.production`)
- **Any other sensitive secrets, private keys, or tokens**

If secrets are accidentally exposed, immediately revoke and rotate the affected keys and notify the repository maintainers.
