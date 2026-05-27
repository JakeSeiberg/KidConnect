'''
Flask middle layer for Kid Connect message board
'''
from flask import Flask, request, jsonify, send_from_directory
from create_db import get_conn, init_db, get_posts_for_class, add_post
import sqlite3
import os

app = Flask(__name__)

# ── helpers ────────────────────────────────────────────────────────────────────

def get_all_posts_flat():
    """Return every post across all classes, newest first."""
    conn = get_conn()
    rows = conn.execute("""
        SELECT
            po.id,
            po.parent_post_id,
            po.body,
            po.created_at,
            p.name  AS author,
            p.id    AS participant_id,
            c.id    AS class_id,
            c.name  AS class_name
        FROM posts po
        JOIN participants p ON p.id = po.participant_id
        JOIN classes      c ON c.id = po.class_id
        ORDER BY po.created_at DESC;
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_classes():
    conn = get_conn()
    rows = conn.execute("SELECT id, name FROM classes ORDER BY id;").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_participants(class_id=None):
    conn = get_conn()
    if class_id:
        rows = conn.execute(
            "SELECT id, name, class_id FROM participants WHERE class_id = ? ORDER BY name;",
            (class_id,)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT id, name, class_id FROM participants ORDER BY name;"
        ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── routes ─────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    return send_from_directory(os.path.dirname(os.path.abspath(__file__)), "test_frontend.html")


@app.route("/api/posts", methods=["GET"])
def api_get_posts():
    """GET /api/posts  — return all posts (optionally filter by class_id)"""
    class_id = request.args.get("class_id", type=int)
    if class_id:
        posts = get_posts_for_class(class_id)   # threaded
        return jsonify({"ok": True, "posts": posts, "threaded": True})
    else:
        posts = get_all_posts_flat()
        return jsonify({"ok": True, "posts": posts, "threaded": False})


@app.route("/api/posts", methods=["POST"])
def api_add_post():
    """
    POST /api/posts
    Body (JSON): { participant_id, class_id, body, parent_post_id? }
    """
    data = request.get_json(force=True)
    participant_id = data.get("participant_id")
    class_id       = data.get("class_id")
    body           = (data.get("body") or "").strip()
    parent_post_id = data.get("parent_post_id")   # optional

    if not participant_id or not class_id or not body:
        return jsonify({"ok": False, "error": "participant_id, class_id, and body are required"}), 400

    try:
        post_id = add_post(
            participant_id=int(participant_id),
            class_id=int(class_id),
            body=body,
            parent_post_id=int(parent_post_id) if parent_post_id else None,
        )
        return jsonify({"ok": True, "post_id": post_id}), 201
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/api/classes", methods=["GET"])
def api_get_classes():
    return jsonify({"ok": True, "classes": get_classes()})


@app.route("/api/classes", methods=["POST"])
def api_add_class():
    """
    POST /api/classes
    Body (JSON): { name }
    """
    data = request.get_json(force=True)
    name = (data.get("name") or "").strip()

    if not name:
        return jsonify({"ok": False, "error": "name is required"}), 400

    conn = get_conn()
    try:
        with conn:
            cur = conn.execute("INSERT INTO classes (name) VALUES (?);", (name,))
            class_id = cur.lastrowid
        conn.close()
        return jsonify({"ok": True, "class_id": class_id, "name": name}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"ok": False, "error": f"A class named '{name}' already exists."}), 409
    except Exception as e:
        conn.close()
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/api/participants", methods=["GET"])
def api_get_participants():
    class_id = request.args.get("class_id", type=int)
    return jsonify({"ok": True, "participants": get_participants(class_id)})


# ── main ───────────────────────────────────────────────────────────────────────

def main():
    print("Initialising database …")
    init_db()
    print("Starting Flask app on http://127.0.0.1:5001")
    app.run(debug=True, port=5001)


if __name__ == "__main__":
    main()