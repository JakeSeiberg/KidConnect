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
    Body (JSON): { name, teacher_name }
    Creates a class and adds the teacher as the first participant.
    Returns: { ok, class_id, join_code, name, group, participant }
    join_code is just the class id as a string.
    """
    data         = request.get_json(force=True)
    name         = (data.get("name") or "").strip()
    teacher_name = (data.get("teacher_name") or "").strip()

    if not name:
        return jsonify({"ok": False, "error": "name is required"}), 400
    if not teacher_name:
        return jsonify({"ok": False, "error": "teacher_name is required"}), 400

    conn = get_conn()
    try:
        with conn:
            # Create the class
            cur = conn.execute("INSERT INTO classes (name) VALUES (?);", (name,))
            class_id = cur.lastrowid

            # Add teacher as first participant
            cur2 = conn.execute(
                "INSERT INTO participants (class_id, name) VALUES (?, ?);",
                (class_id, teacher_name)
            )
            participant_id = cur2.lastrowid

        conn.close()

        join_code = str(class_id)

        return jsonify({
            "ok":        True,
            "class_id":  class_id,
            "join_code": join_code,
            "name":      name,
            "group": {
                "id":        class_id,
                "name":      name,
                "join_code": join_code,
            },
            "participant": {
                "id":   participant_id,
                "name": teacher_name,
                "role": "teacher",
            },
        }), 201

    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"ok": False, "error": f"A class named '{name}' already exists."}), 409
    except Exception as e:
        conn.close()
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/api/classes/join", methods=["POST"])
def api_join_class():
    """
    POST /api/classes/join
    Body (JSON): { join_code, name, child_name }
    join_code is the class id as a string.
    Returns: { ok, group, participant }
    """
    data       = request.get_json(force=True)
    join_code  = (data.get("join_code") or "").strip()
    name       = (data.get("name") or "").strip()
    child_name = (data.get("child_name") or "").strip()

    if not join_code or not name or not child_name:
        return jsonify({"ok": False, "error": "join_code, name, and child_name are required"}), 400

    # join_code is just the class id
    try:
        class_id = int(join_code)
    except ValueError:
        return jsonify({"ok": False, "error": "Invalid join code."}), 400

    conn = get_conn()
    try:
        # Look up the class
        row = conn.execute(
            "SELECT id, name FROM classes WHERE id = ?;", (class_id,)
        ).fetchone()

        if row is None:
            conn.close()
            return jsonify({"ok": False, "error": "Join code not recognised."}), 404

        class_row = dict(row)

        # Add the parent as a participant (ignore if already exists)
        with conn:
            try:
                cur = conn.execute(
                    "INSERT INTO participants (class_id, name) VALUES (?, ?);",
                    (class_id, name)
                )
                participant_id = cur.lastrowid
            except sqlite3.IntegrityError:
                # Already in the class — look them up
                existing = conn.execute(
                    "SELECT id FROM participants WHERE class_id = ? AND name = ?;",
                    (class_id, name)
                ).fetchone()
                participant_id = existing["id"]

        conn.close()

        join_code_str = str(class_id)

        return jsonify({
            "ok": True,
            "group": {
                "id":        class_row["id"],
                "name":      class_row["name"],
                "join_code": join_code_str,
            },
            "participant": {
                "id":         participant_id,
                "name":       name,
                "child_name": child_name,
                "role":       "parent",
            },
        }), 200

    except Exception as e:
        conn.close()
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/api/classes/<int:class_id>/posts", methods=["GET"])
def api_get_class_posts(class_id):
    """
    GET /api/classes/<class_id>/posts
    Returns flat list of posts for the class, newest first,
    including participant_id so the frontend can detect ownership.
    """
    conn = get_conn()
    rows = conn.execute("""
        SELECT
            po.id,
            po.parent_post_id,
            po.body,
            po.created_at,
            p.name AS parent_name,
            p.id   AS participant_id,
            c.name AS class_name
        FROM posts po
        JOIN participants p ON p.id = po.participant_id
        JOIN classes      c ON c.id = po.class_id
        WHERE po.class_id = ?
        ORDER BY po.created_at ASC;
    """, (class_id,)).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/classes/<int:class_id>/posts", methods=["POST"])
def api_add_class_post(class_id):
    """
    POST /api/classes/<class_id>/posts
    Body (JSON): { participant_id, body }
    """
    data           = request.get_json(force=True)
    participant_id = data.get("participant_id")
    body           = (data.get("body") or "").strip()

    if not participant_id or not body:
        return jsonify({"ok": False, "error": "participant_id and body are required"}), 400

    try:
        post_id = add_post(
            participant_id=int(participant_id),
            class_id=class_id,
            body=body,
        )
        return jsonify({"ok": True, "post_id": post_id}), 201
    except Exception as e:
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