"""Minimal WSGI entrypoint for static Underdelve Syndicate web build.

This file exists so Python-based deployment targets can discover an `app`
callable automatically.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable
import mimetypes


BASE_DIR = Path(__file__).resolve().parent
INDEX_FILE = BASE_DIR / "index.html"
ASSETS_DIR = BASE_DIR / "assets"


def _read_file(path: Path) -> bytes:
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(path)
    return path.read_bytes()


def app(environ, start_response) -> Iterable[bytes]:
    path = (environ.get("PATH_INFO") or "/").rstrip("/") or "/"

    try:
        if path in {"/", "/index.html"}:
            body = _read_file(INDEX_FILE)
            start_response("200 OK", [("Content-Type", "text/html; charset=utf-8")])
            return [body]

        if path.startswith("/assets/"):
            rel_path = path.removeprefix("/assets/")
            asset_file = ASSETS_DIR / rel_path
            body = _read_file(asset_file)
            content_type, _ = mimetypes.guess_type(asset_file.name)
            start_response("200 OK", [("Content-Type", content_type or "application/octet-stream")])
            return [body]

        start_response("404 Not Found", [("Content-Type", "text/plain; charset=utf-8")])
        return [b"Not Found"]
    except FileNotFoundError:
        start_response("404 Not Found", [("Content-Type", "text/plain; charset=utf-8")])
        return [b"Not Found"]
