# Security Policy

The **SkillTwin** team takes security and data integrity seriously. This document outlines our policy regarding reporting potential vulnerabilities and safeguarding secrets.

---

## Supported Versions

SkillTwin is an active open-source hackathon project undergoing continuous iteration. Security updates and bug fixes are applied exclusively to the latest revision of the primary branch:

| Version / Branch | Supported | Notes |
| :--- | :--- | :--- |
| `main` (latest commit) | :white_check_mark: | Primary supported branch |
| Older commits / feature branches | :x: | Please rebase or merge onto `main` |

---

## Reporting a Vulnerability

If you discover a security vulnerability in SkillTwin, please **do not open a public issue or discussion**. Responsible disclosure protects all users and learners.

### Reporting Procedure:
1. **GitHub Private Vulnerability Reporting**:
   - Navigate to the **Security** tab of the SkillTwin GitHub repository: [https://github.com/Bhumik-47/SkillTwin/security](https://github.com/Bhumik-47/SkillTwin/security)
   - Click **Report a vulnerability** to submit a private advisory directly to the project maintainers.
2. **Alternative Maintainer Contact**:
   - If Private Vulnerability Reporting is unavailable, reach out privately to repository maintainers via GitHub before publishing details.

---

## What Information to Include in a Report

To help us assess and resolve the issue quickly, please include:
- A clear description of the vulnerability and its potential impact.
- Step-by-step instructions or a minimal Proof of Concept (PoC) to reproduce the behavior.
- Affected components (e.g., `backend/auth`, `backend/routers`, `frontend/src/lib/api.ts`, Gemini agent endpoints).
- Any proposed remediation or patch, if available.

We will acknowledge receipt of your report, investigate the issue, and coordinate a fix in a timely manner.

---

## Strict Policy on Secrets & Credentials

> ⚠️ **CRITICAL WARNING**: Never commit or attach real secrets in issues, pull requests, vulnerability reports, or git history.

### Prohibited Items:
Contributors and reporters must **NEVER** commit or include:
- **Google Gemini API Keys** (`GEMINI_API_KEY`) or third-party AI keys
- **JWT Secret Keys** (`SECRET_KEY`, `JWT_SECRET_KEY`)
- **User Passwords & Hashes**
- **Database Credentials** or live database connection strings containing passwords
- **Local Environment Files** (`.env`, `.env.local`, `.env.production`)

If you suspect a secret was committed accidentally:
1. Immediately rotate / revoke the exposed key with the service provider (e.g., Google AI Studio).
2. Cleanse git history if needed and notify repository maintainers.
