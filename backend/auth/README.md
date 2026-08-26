# Authentication & Security Module

The `backend/auth/` package handles user identity, password hashing, JWT bearer token lifecycle, and route-level authorization guards for SkillTwin.

---

## 🔒 Responsibilities

1. **User Registration (`/auth/signup`)**:
   - Validates input credentials.
   - Hashes passwords using modern cryptography (e.g. `bcrypt` / `argon2`).
   - Automatically bootstraps a default `LearnerProfile` with preferences and initial skill state.

2. **User Authentication (`/auth/login`)**:
   - Verifies credentials against stored password hashes.
   - Issues signed JWT access tokens containing user claims (`sub`, `user_id`, `exp`).

3. **FastAPI Security Dependencies**:
   - `get_current_user`: Dependency to validate bearer tokens on protected endpoints and inject the authenticated `User` model.
   - `get_optional_user`: Supports unauthenticated exploration of static skill graphs while enriching with personalized mastery when tokens are present.

---

## 📂 Key Components

- **`jwt.py`**: Token creation, signing, decoding, and expiration logic.
- **`security.py`**: Password hashing and verification utilities.
- **`dependencies.py`**: FastAPI `Depends()` security extractors.
