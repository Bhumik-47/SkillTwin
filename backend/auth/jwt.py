"""
JWT Token Creation, Decoding, and Validation
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import json
import hmac
import hashlib
import base64

from backend.config import settings

# Attempt using jose or pyjwt
try:
    from jose import jwt, JWTError
    HAS_JOSE = True
except Exception:
    HAS_JOSE = False

try:
    import jwt as pyjwt
    HAS_PYJWT = True
except Exception:
    HAS_PYJWT = False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT access token.
    `data` typically contains {"sub": user_id, "email": email}.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": int(expire.timestamp())})

    if HAS_JOSE:
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    elif HAS_PYJWT:
        return pyjwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    else:
        # Pure Python fallback JWT implementation
        header = {"alg": "HS256", "typ": "JWT"}
        header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        payload_b64 = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
        signing_input = f"{header_b64}.{payload_b64}".encode()
        signature = hmac.new(settings.SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
        sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
        return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT access token.
    Returns the payload dictionary or None if invalid/expired.
    """
    try:
        if HAS_JOSE:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        elif HAS_PYJWT:
            return pyjwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        else:
            # Pure Python fallback decoding & signature verification
            parts = token.split(".")
            if len(parts) != 3:
                return None
            header_b64, payload_b64, sig_b64 = parts
            
            # Verify signature
            signing_input = f"{header_b64}.{payload_b64}".encode()
            expected_sig = hmac.new(settings.SECRET_KEY.encode(), signing_input, hashlib.sha256).digest()
            expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
            if not hmac.compare_digest(sig_b64, expected_sig_b64):
                return None

            # Add padding back
            padding = 4 - (len(payload_b64) % 4)
            if padding != 4:
                payload_b64 += "=" * padding
            payload_json = base64.urlsafe_b64decode(payload_b64.encode()).decode()
            payload = json.loads(payload_json)

            # Check expiration
            exp = payload.get("exp")
            if exp and datetime.now(timezone.utc).timestamp() > exp:
                return None
            return payload
    except Exception:
        return None
