"""
    This module handles the verification of JWT tokens from Supabase Auth
    using JWKS (JSON Web Key Set), ensuring that requests to
    protected endpoints are processed only if they originate from
    authorized users.
"""

import os
import httpx
from jose import jwt, JWTError
from fastapi import HTTPException, Header

SUPABASE_URL = os.environ.get("SUPABASE_URL")
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

_jwks_cache = None


def _get_jwks() -> dict:
    """ambil JWKS dari Supabase, dengan caching sederhana in-memory."""
    global _jwks_cache
    if _jwks_cache is None:
        try:
            response = httpx.get(JWKS_URL, timeout=5.0)
            response.raise_for_status()
            _jwks_cache = response.json()
        except httpx.HTTPError as e:
            print(f"[ERROR] Gagal mengambil JWKS dari Supabase: {e}")
            raise HTTPException(
                status_code=500,
                detail="[ERROR] Gagal memverifikasi kredensial autentikasi.",
            )
    return _jwks_cache


def verify_token(authorization: str = Header(...)) -> dict:
    """
    Memverifikasi JWT token dari header Authorization menggunakan
    JWKS Supabase, mengembalikan payload berisi user_id dan data
    user lainnya.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="[ERROR] Format header Authorization tidak valid.",
        )

    token = authorization.replace("Bearer ", "")

    try:
        jwks = _get_jwks()
        unverified_header = jwt.get_unverified_header(token)

        key = next(
            (k for k in jwks["keys"] if k["kid"] == unverified_header["kid"]),
            None,
        )

        if key is None:
            raise HTTPException(
                status_code=401,
                detail="[ERROR] Kunci verifikasi token tidak ditemukan.",
            )

        payload = jwt.decode(
            token,
            key,
            algorithms=["ES256"],
            audience="authenticated",
        )
        return payload

    except JWTError as e:
        print(f"[ERROR] Gagal memverifikasi token: {e}")
        raise HTTPException(
            status_code=401,
            detail="[ERROR] Token tidak valid atau sudah kedaluwarsa.",
        )