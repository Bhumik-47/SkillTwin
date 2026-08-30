"""
Password Hashing and Cryptographic Utilities
"""
import hashlib
import hmac
import secrets

try:
    import bcrypt
    HAS_BCRYPT = True
except Exception:
    HAS_BCRYPT = False

try:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    HAS_PASSLIB = True
except Exception:
    HAS_PASSLIB = False


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a stored hashed password string."""
    if not plain_password or not hashed_password:
        return False

    # Direct bcrypt verification
    if HAS_BCRYPT and (hashed_password.startswith("$2a$") or hashed_password.startswith("$2b$") or hashed_password.startswith("$2y$")):
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            pass

    # Passlib check fallback
    if HAS_PASSLIB:
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            pass

    # Fallback PBKDF2 verification
    if hashed_password.startswith("pbkdf2$"):
        parts = hashed_password.split("$")
        if len(parts) == 4:
            _, iterations, salt, hash_val = parts
            computed = hashlib.pbkdf2_hmac(
                "sha256",
                plain_password.encode("utf-8"),
                salt.encode("utf-8"),
                int(iterations)
            ).hex()
            return hmac.compare_digest(computed, hash_val)

    # Simple hash fallback
    return False


def get_password_hash(password: str) -> str:
    """Hash a password securely using bcrypt (or PBKDF2 fallback)."""
    if HAS_BCRYPT:
        try:
            return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        except Exception:
            pass

    if HAS_PASSLIB:
        try:
            return pwd_context.hash(password)
        except Exception:
            pass

    # Secure fallback using PBKDF2-HMAC-SHA256
    salt = secrets.token_hex(16)
    iterations = 100_000
    hash_val = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations
    ).hex()
    return f"pbkdf2${iterations}${salt}${hash_val}"

