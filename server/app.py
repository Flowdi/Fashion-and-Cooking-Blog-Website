import json, os, re, secrets, sqlite3, time, uuid
from datetime import datetime
from functools import wraps
from pathlib import Path
from flask import Flask, jsonify, request, session
from PIL import Image
from werkzeug.security import check_password_hash

DATA_DIR=Path(os.environ.get("NELLOS_DATA_DIR","/var/lib/nellos-world"))
UPLOAD_DIR=Path(os.environ.get("NELLOS_UPLOAD_DIR","/var/www/nellos-world.de/uploads"))
DB=DATA_DIR/"posts.db"
app=Flask(__name__)
app.secret_key=os.environ["NELLOS_SESSION_SECRET"]
app.config.update(MAX_CONTENT_LENGTH=12*1024*1024,SESSION_COOKIE_HTTPONLY=True,SESSION_COOKIE_SECURE=True,SESSION_COOKIE_SAMESITE="Strict",PERMANENT_SESSION_LIFETIME=60*60*12)
attempts={}

def conn():
    db=sqlite3.connect(DB);db.row_factory=sqlite3.Row;return db
def init_db():
    DATA_DIR.mkdir(parents=True,exist_ok=True);UPLOAD_DIR.mkdir(parents=True,exist_ok=True)
    with conn() as db: db.execute("CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY AUTOINCREMENT,slug TEXT UNIQUE NOT NULL,category TEXT NOT NULL,title TEXT NOT NULL,excerpt TEXT NOT NULL,content TEXT NOT NULL,image TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'draft',created_at TEXT NOT NULL)")
def auth(fn):
    @wraps(fn)
    def wrapped(*a,**kw):
        if not session.get("admin"): return jsonify(error="unauthorized"),401
        return fn(*a,**kw)
    return wrapped
def serialize(row):
    return {"id":row["id"],"slug":row["slug"],"category":row["category"],"title":row["title"],"excerpt":row["excerpt"],"content":json.loads(row["content"]),"image":row["image"],"status":row["status"],"date":datetime.fromisoformat(row["created_at"]).strftime("%d.%m.%Y"),"readTime":f"{max(2,len(' '.join(json.loads(row['content'])).split())//180+1)} Min."}
def slugify(value):
    value=value.lower().replace("ä","ae").replace("ö","oe").replace("ü","ue").replace("ß","ss")
    return re.sub(r"[^a-z0-9]+","-",value).strip("-")[:80]

@app.after_request
def headers(response):
    response.headers["X-Content-Type-Options"]="nosniff";response.headers["X-Frame-Options"]="DENY";response.headers["Referrer-Policy"]="same-origin";return response
@app.get("/api/posts")
def public_posts():
    with conn() as db: rows=db.execute("SELECT * FROM posts WHERE status='published' ORDER BY created_at DESC").fetchall()
    return jsonify([serialize(r) for r in rows])
@app.post("/api/login")
def login():
    ip=request.remote_addr or "unknown";now=time.time();recent=[t for t in attempts.get(ip,[]) if now-t<900];attempts[ip]=recent
    if len(recent)>=8:return jsonify(error="rate_limited"),429
    password=(request.get_json(silent=True) or {}).get("password","")
    if not check_password_hash(os.environ["NELLOS_ADMIN_PASSWORD_HASH"],password):attempts[ip].append(now);return jsonify(error="invalid"),401
    session.clear();session["admin"]=True;session.permanent=True;attempts.pop(ip,None);return jsonify(ok=True)
@app.post("/api/logout")
def logout():session.clear();return jsonify(ok=True)
@app.get("/api/admin/posts")
@auth
def admin_posts():
    with conn() as db:rows=db.execute("SELECT * FROM posts ORDER BY created_at DESC").fetchall()
    return jsonify([serialize(r) for r in rows])
@app.post("/api/admin/posts")
@auth
def create_post():
    title=request.form.get("title","").strip();category=request.form.get("category","");excerpt=request.form.get("excerpt","").strip();body=request.form.get("content","").strip();status=request.form.get("status","")
    if not title or category not in ("Fashion","Cooking") or not excerpt or not body or status not in ("draft","published"):return jsonify(error="invalid"),400
    image=request.files.get("image");ext=Path(image.filename or "").suffix.lower() if image else ""
    if not image or ext not in (".jpg",".jpeg",".png",".webp"):return jsonify(error="image"),400
    filename=f"{uuid.uuid4().hex}{ext}";path=UPLOAD_DIR/filename;image.save(path)
    try:
        with Image.open(path) as im:
            im.verify()
        with Image.open(path) as im:
            im.thumbnail((2400,2400));im.save(path,optimize=True,quality=86)
    except Exception:path.unlink(missing_ok=True);return jsonify(error="image"),400
    slug=f"{slugify(title)}-{secrets.token_hex(3)}";paragraphs=[p.strip() for p in re.split(r"\n\s*\n",body) if p.strip()]
    with conn() as db:db.execute("INSERT INTO posts(slug,category,title,excerpt,content,image,status,created_at) VALUES(?,?,?,?,?,?,?,?)",(slug,category,title,excerpt,json.dumps(paragraphs,ensure_ascii=False),f"/uploads/{filename}",status,datetime.now().isoformat()))
    return jsonify(ok=True,slug=slug),201
@app.delete("/api/admin/posts/<int:post_id>")
@auth
def delete_post(post_id):
    with conn() as db:
        row=db.execute("SELECT image FROM posts WHERE id=?",(post_id,)).fetchone()
        if not row:return jsonify(error="missing"),404
        db.execute("DELETE FROM posts WHERE id=?",(post_id,))
    if row["image"].startswith("/uploads/"):(UPLOAD_DIR/Path(row["image"]).name).unlink(missing_ok=True)
    return jsonify(ok=True)

init_db()
