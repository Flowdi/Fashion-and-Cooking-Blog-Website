import json
import os
import re
import secrets
import sqlite3
import time
import uuid
from datetime import datetime
from email.utils import format_datetime
from functools import wraps
from pathlib import Path
from xml.sax.saxutils import escape

from flask import Flask, Response, jsonify, request, session
from PIL import Image
from werkzeug.security import check_password_hash, generate_password_hash

DATA_DIR = Path(os.environ.get("NELLOS_DATA_DIR", "/var/lib/nellos-world"))
UPLOAD_DIR = Path(
    os.environ.get("NELLOS_UPLOAD_DIR", "/var/www/nellos-world.de/uploads")
)
DB = DATA_DIR / "posts.db"
ALLOWED_IMAGES = {".jpg", ".jpeg", ".png", ".webp"}

app = Flask(__name__)
app.secret_key = os.environ["NELLOS_SESSION_SECRET"]
app.config.update(
    MAX_CONTENT_LENGTH=40 * 1024 * 1024,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_SAMESITE="Strict",
    PERMANENT_SESSION_LIFETIME=60 * 60 * 12,
)
attempts = {}


def conn():
    db = sqlite3.connect(DB)
    db.row_factory = sqlite3.Row
    return db


def init_db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    with conn() as db:
        db.execute("""CREATE TABLE IF NOT EXISTS posts(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT UNIQUE NOT NULL,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                excerpt TEXT NOT NULL,
                content TEXT NOT NULL,
                image TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'draft',
                created_at TEXT NOT NULL
            )""")
        existing = {row[1] for row in db.execute("PRAGMA table_info(posts)")}
        additions = {
            "gallery": "TEXT NOT NULL DEFAULT '[]'",
            "duration": "TEXT NOT NULL DEFAULT ''",
            "servings": "TEXT NOT NULL DEFAULT ''",
            "ingredients": "TEXT NOT NULL DEFAULT '[]'",
            "steps": "TEXT NOT NULL DEFAULT '[]'",
            "materials": "TEXT NOT NULL DEFAULT '[]'",
            "difficulty": "TEXT NOT NULL DEFAULT ''",
            "prep_time": "TEXT NOT NULL DEFAULT ''",
            "cook_time": "TEXT NOT NULL DEFAULT ''",
            "dietary_tags": "TEXT NOT NULL DEFAULT '[]'",
            "project_status": "TEXT NOT NULL DEFAULT ''",
            "fabric_amount": "TEXT NOT NULL DEFAULT ''",
            "pattern_source": "TEXT NOT NULL DEFAULT ''",
            "care_instructions": "TEXT NOT NULL DEFAULT ''",
            "updated_at": "TEXT NOT NULL DEFAULT ''",
        }
        for column, definition in additions.items():
            if column not in existing:
                db.execute(f"ALTER TABLE posts ADD COLUMN {column} {definition}")
        db.execute(
            "CREATE INDEX IF NOT EXISTS idx_posts_status_created ON posts(status, created_at DESC)"
        )
        db.execute(
            "CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL)"
        )
        db.execute("PRAGMA optimize")


def auth(fn):
    @wraps(fn)
    def wrapped(*args, **kwargs):
        if not session.get("admin"):
            return jsonify(error="unauthorized"), 401
        return fn(*args, **kwargs)

    return wrapped


def json_list(value):
    try:
        return json.loads(value or "[]")
    except (TypeError, json.JSONDecodeError):
        return []


def serialize(row):
    content = json_list(row["content"])
    result = {
        "id": row["id"],
        "slug": row["slug"],
        "category": row["category"],
        "title": row["title"],
        "excerpt": row["excerpt"],
        "content": content,
        "image": row["image"],
        "gallery": json_list(row["gallery"]),
        "status": row["status"],
        "materials": json_list(row["materials"]),
        "difficulty": row["difficulty"],
        "projectStatus": row["project_status"],
        "fabricAmount": row["fabric_amount"],
        "patternSource": row["pattern_source"],
        "careInstructions": row["care_instructions"],
        "date": datetime.fromisoformat(row["created_at"]).strftime("%d.%m.%Y"),
        "readTime": f"{max(2, len(' '.join(content).split()) // 180 + 1)} Min.",
    }
    if row["category"] == "Cooking":
        result["recipe"] = {
            "duration": row["duration"],
            "prepTime": row["prep_time"],
            "cookTime": row["cook_time"],
            "servings": row["servings"],
            "dietaryTags": json_list(row["dietary_tags"]),
            "ingredients": json_list(row["ingredients"]),
            "steps": json_list(row["steps"]),
        }
    return result


def slugify(value):
    value = (
        value.lower()
        .replace("ä", "ae")
        .replace("ö", "oe")
        .replace("ü", "ue")
        .replace("ß", "ss")
    )
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")[:80]


def lines(value):
    return [line.strip() for line in (value or "").splitlines() if line.strip()]


def paragraphs(value):
    return [part.strip() for part in re.split(r"\n\s*\n", value or "") if part.strip()]


def save_image(file):
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_IMAGES:
        raise ValueError("invalid image")
    filename = f"{uuid.uuid4().hex}{extension}"
    path = UPLOAD_DIR / filename
    file.save(path)
    try:
        with Image.open(path) as image:
            image.verify()
        with Image.open(path) as image:
            image.thumbnail((2400, 2400))
            image.save(path, optimize=True, quality=86)
    except Exception:
        path.unlink(missing_ok=True)
        raise ValueError("invalid image")
    return f"/uploads/{filename}"


def remove_upload(url):
    if url and url.startswith("/uploads/"):
        (UPLOAD_DIR / Path(url).name).unlink(missing_ok=True)


def current_password_hash():
    with conn() as db:
        row = db.execute(
            "SELECT value FROM settings WHERE key='password_hash'"
        ).fetchone()
    return row["value"] if row else os.environ["NELLOS_ADMIN_PASSWORD_HASH"]


@app.after_request
def security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "same-origin"
    response.headers["Permissions-Policy"] = "camera=(), geolocation=(), microphone=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
    if request.path in ("/api/posts", "/api/feed.xml") and request.method == "GET":
        response.headers["Cache-Control"] = "public, max-age=60"
    else:
        response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/api/posts")
def public_posts():
    with conn() as db:
        rows = db.execute(
            "SELECT * FROM posts WHERE status='published' ORDER BY created_at DESC"
        ).fetchall()
    return jsonify([serialize(row) for row in rows])


@app.get("/api/feed.xml")
def rss_feed():
    with conn() as db:
        rows = db.execute(
            "SELECT slug, category, title, excerpt, created_at FROM posts "
            "WHERE status='published' ORDER BY created_at DESC LIMIT 30"
        ).fetchall()
    items = []
    for row in rows:
        url = f"https://nellos-world.de/beitrag/{row['slug']}"
        published = format_datetime(datetime.fromisoformat(row["created_at"]).astimezone())
        items.append(
            "<item>"
            f"<title>{escape(row['title'])}</title>"
            f"<link>{url}</link>"
            f"<guid isPermaLink=\"true\">{url}</guid>"
            f"<pubDate>{published}</pubDate>"
            f"<category>{escape(row['category'])}</category>"
            f"<description>{escape(row['excerpt'])}</description>"
            "</item>"
        )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<rss version="2.0"><channel>'
        "<title>Nellis Fashion &amp; Food Blog</title>"
        "<link>https://nellos-world.de/</link>"
        "<description>Fashion-Projekte, Rezepte und persönliche Geschichten.</description>"
        '<language>de</language>'
        f"{''.join(items)}"
        "</channel></rss>"
    )
    return Response(xml, content_type="application/rss+xml; charset=utf-8")


@app.get("/api/health")
def health():
    try:
        with conn() as db:
            db.execute("SELECT 1").fetchone()
    except sqlite3.Error:
        return jsonify(status="unavailable"), 503
    return jsonify(status="ok")


@app.post("/api/login")
def login():
    ip = request.remote_addr or "unknown"
    now = time.time()
    recent = [attempt for attempt in attempts.get(ip, []) if now - attempt < 900]
    attempts[ip] = recent
    if len(recent) >= 8:
        return jsonify(error="rate_limited"), 429
    password = (request.get_json(silent=True) or {}).get("password", "")
    if not check_password_hash(current_password_hash(), password):
        attempts[ip].append(now)
        return jsonify(error="invalid"), 401
    session.clear()
    session["admin"] = True
    session.permanent = True
    attempts.pop(ip, None)
    return jsonify(ok=True)


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify(ok=True)


@app.get("/api/admin/posts")
@auth
def admin_posts():
    with conn() as db:
        rows = db.execute("SELECT * FROM posts ORDER BY created_at DESC").fetchall()
    return jsonify([serialize(row) for row in rows])


def post_values(existing=None):
    title = request.form.get("title", "").strip()
    category = request.form.get("category", "")
    excerpt = request.form.get("excerpt", "").strip()
    body = request.form.get("content", "").strip()
    status = request.form.get("status", "")
    if not title or category not in ("Fashion", "Cooking") or not excerpt or not body:
        raise ValueError("invalid fields")
    if len(title) > 140 or len(excerpt) > 300 or len(body) > 30000:
        raise ValueError("content too long")
    if status not in ("draft", "published"):
        raise ValueError("invalid status")
    image_file = request.files.get("image")
    image = existing["image"] if existing else ""
    if image_file and image_file.filename:
        replacement = save_image(image_file)
        if existing:
            remove_upload(image)
        image = replacement
    if not image:
        raise ValueError("missing image")
    gallery = json_list(existing["gallery"]) if existing else []
    available_gallery_slots = max(0, 8 - len(gallery))
    for file in request.files.getlist("gallery")[:available_gallery_slots]:
        if file and file.filename:
            gallery.append(save_image(file))
    removed = set(request.form.getlist("remove_gallery"))
    for url in removed:
        remove_upload(url)
    gallery = [url for url in gallery if url not in removed][:8]
    return {
        "category": category,
        "title": title,
        "excerpt": excerpt,
        "content": json.dumps(paragraphs(body), ensure_ascii=False),
        "image": image,
        "gallery": json.dumps(gallery),
        "status": status,
        "duration": request.form.get("duration", "").strip()[:50],
        "prep_time": request.form.get("prep_time", "").strip()[:50],
        "cook_time": request.form.get("cook_time", "").strip()[:50],
        "servings": request.form.get("servings", "").strip()[:50],
        "dietary_tags": json.dumps(
            lines(request.form.get("dietary_tags", "")[:1000]), ensure_ascii=False
        ),
        "ingredients": json.dumps(
            lines(request.form.get("ingredients", "")[:10000]), ensure_ascii=False
        ),
        "steps": json.dumps(
            lines(request.form.get("steps", "")[:10000]), ensure_ascii=False
        ),
        "materials": json.dumps(
            lines(request.form.get("materials", "")[:10000]), ensure_ascii=False
        ),
        "difficulty": request.form.get("difficulty", "").strip()[:50],
        "project_status": request.form.get("project_status", "").strip()[:80],
        "fabric_amount": request.form.get("fabric_amount", "").strip()[:80],
        "pattern_source": request.form.get("pattern_source", "").strip()[:200],
        "care_instructions": request.form.get("care_instructions", "").strip()[:500],
        "updated_at": datetime.now().isoformat(),
    }


@app.post("/api/admin/posts")
@auth
def create_post():
    try:
        values = post_values()
    except ValueError as error:
        return jsonify(error=str(error)), 400
    slug = f"{slugify(values['title'])}-{secrets.token_hex(3)}"
    columns = ["slug", *values.keys(), "created_at"]
    payload = [slug, *values.values(), datetime.now().isoformat()]
    with conn() as db:
        db.execute(
            f"INSERT INTO posts({','.join(columns)}) VALUES({','.join('?' for _ in columns)})",
            payload,
        )
    return jsonify(ok=True, slug=slug), 201


@app.put("/api/admin/posts/<int:post_id>")
@auth
def update_post(post_id):
    with conn() as db:
        existing = db.execute("SELECT * FROM posts WHERE id=?", (post_id,)).fetchone()
        if not existing:
            return jsonify(error="missing"), 404
        try:
            values = post_values(existing)
        except ValueError as error:
            return jsonify(error=str(error)), 400
        assignments = ",".join(f"{column}=?" for column in values)
        db.execute(
            f"UPDATE posts SET {assignments} WHERE id=?",
            [*values.values(), post_id],
        )
    return jsonify(ok=True)


@app.patch("/api/admin/posts/<int:post_id>/status")
@auth
def change_status(post_id):
    status = (request.get_json(silent=True) or {}).get("status")
    if status not in ("draft", "published"):
        return jsonify(error="invalid"), 400
    with conn() as db:
        result = db.execute(
            "UPDATE posts SET status=?, updated_at=? WHERE id=?",
            (status, datetime.now().isoformat(), post_id),
        )
    return jsonify(ok=True) if result.rowcount else (jsonify(error="missing"), 404)


@app.delete("/api/admin/posts/<int:post_id>")
@auth
def delete_post(post_id):
    with conn() as db:
        row = db.execute(
            "SELECT image, gallery FROM posts WHERE id=?", (post_id,)
        ).fetchone()
        if not row:
            return jsonify(error="missing"), 404
        db.execute("DELETE FROM posts WHERE id=?", (post_id,))
    remove_upload(row["image"])
    for image in json_list(row["gallery"]):
        remove_upload(image)
    return jsonify(ok=True)


@app.post("/api/admin/password")
@auth
def change_password():
    data = request.get_json(silent=True) or {}
    current = data.get("current", "")
    new = data.get("new", "")
    if not check_password_hash(current_password_hash(), current):
        return jsonify(error="invalid_current"), 400
    if len(new) < 12:
        return jsonify(error="too_short"), 400
    with conn() as db:
        db.execute(
            "INSERT INTO settings(key,value) VALUES('password_hash',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
            (generate_password_hash(new),),
        )
    return jsonify(ok=True)


init_db()
