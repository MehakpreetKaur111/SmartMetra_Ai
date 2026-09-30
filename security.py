from datetime import datetime, timedelta, timezone
from enum import Enum

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import User

settings = get_settings()
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/token")


class Role(str, Enum):
    CONSUMER = "CONSUMER"
    INDUSTRY = "INDUSTRY"
    GOVERNMENT = "GOVERNMENT"
    ADMIN = "ADMIN"


def hash_password(raw: str) -> str:
    return pwd.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    return pwd.verify(raw, hashed)


def create_token(email: str, roles: list[str]) -> str:
    payload = {
        "sub": email,
        "roles": roles,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MIN),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)


def get_current_user(
    token: str = Depends(oauth2),
    db: Session = Depends(get_db),
) -> User:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        email = payload.get("sub")
        if not email:
            raise exc
    except JWTError:
        raise exc

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise exc
    return user


def require_roles(*allowed: Role):
    allowed_set = {r.value for r in allowed}

    def _dep(user: User = Depends(get_current_user)) -> User:
        user_roles = {r.name for r in user.roles}
        if not (user_roles & allowed_set):
            raise HTTPException(status_code=403, detail="Insufficient role")
        return user

    return _dep