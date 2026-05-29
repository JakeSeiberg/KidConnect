"""
database.py — SQLite database setup for a message board proof of concept.
 
Run:
    python database.py
"""
 
import sqlite3
import json
 
 
DB_PATH = "messageboard.db"
 
 
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn
 
 
 
def init_db():
    conn = get_conn()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS classes (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                name       TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );
        """)
 
        conn.execute("""
            CREATE TABLE IF NOT EXISTS participants (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                class_id   INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
                name       TEXT NOT NULL,
                joined_at  TEXT NOT NULL DEFAULT (datetime('now')),
                UNIQUE (class_id, name)
            );
        """)
 
        conn.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
                class_id       INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
                parent_post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                body           TEXT NOT NULL,
                created_at     TEXT NOT NULL DEFAULT (datetime('now'))
            );
        """)
    conn.close()
    print("Database ready.")
 
 

 
def seed():
    conn = get_conn()
    with conn:
        # Classes 1–6
        for i in range(1, 7):
            conn.execute(
                "INSERT OR IGNORE INTO classes (name) VALUES (?);",
                (f"Class {i}",)
            )
 
        # Parents 1–10, each enrolled in a class (spread across classes 1–6)
        for i in range(1, 11):
            class_id = ((i - 1) % 6) + 1  # distributes evenly: 1,2,3,4,5,6,1,2,3,4
            conn.execute(
                "INSERT OR IGNORE INTO participants (class_id, name) VALUES (?, ?);",
                (class_id, f"Parent {i}")
            )
 
    conn.close()
    print("Seed data inserted.")
 
 

 
def get_all_classes():
    conn = get_conn()
    rows = conn.execute("""
        SELECT
            c.id,
            c.name,
            c.created_at,
            GROUP_CONCAT(p.name, ', ') AS participants
        FROM classes c
        LEFT JOIN participants p ON p.class_id = c.id
        GROUP BY c.id
        ORDER BY c.id;
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]
 
 
def add_participant(class_id: int, name: str):
    conn = get_conn()
    with conn:
        try:
            conn.execute(
                "INSERT INTO participants (class_id, name) VALUES (?, ?);",
                (class_id, name)
            )
            print(f"Added '{name}' to class id={class_id}.")
        except sqlite3.IntegrityError:
            print(f"'{name}' is already in class id={class_id}.")
    conn.close()
 
 
def remove_participant(class_id: int, name: str):
    conn = get_conn()
    with conn:
        cur = conn.execute(
            "DELETE FROM participants WHERE class_id = ? AND name = ?;",
            (class_id, name)
        )
    conn.close()
    if cur.rowcount:
        print(f"Removed '{name}' from class id={class_id}.")
    else:
        print(f"'{name}' was not found in class id={class_id}.")
 
 
def print_classes(classes):
    for c in classes:
        participants = c["participants"] or "(none)"
        print(f"  [{c['id']}] {c['name']:<12} participants: {participants}")
 
 
def add_post(participant_id: int, class_id: int, body: str, parent_post_id: int = None) -> int:
    """
    Create a new post and return its id.
    Pass parent_post_id to make it a reply to an existing post.
    """
    conn = get_conn()
    with conn:
        cur = conn.execute(
            """INSERT INTO posts (participant_id, class_id, parent_post_id, body)
               VALUES (?, ?, ?, ?);""",
            (participant_id, class_id, parent_post_id, body)
        )
        post_id = cur.lastrowid
    conn.close()
    label = f"reply to post id={parent_post_id}" if parent_post_id else "top-level post"
    print(f"Post id={post_id} added ({label}).")
    return post_id
 
 
def reply_to_post(participant_id: int, post_id: int, body: str) -> int:
    """
    Convenience wrapper — reply to an existing post.
    Automatically inherits the class_id from the parent post.
    """
    conn = get_conn()
    row = conn.execute(
        "SELECT class_id FROM posts WHERE id = ?;", (post_id,)
    ).fetchone()
    conn.close()
 
    if row is None:
        raise ValueError(f"No post found with id={post_id}")
 
    return add_post(
        participant_id=participant_id,
        class_id=row["class_id"],
        body=body,
        parent_post_id=post_id,
    )
 
 
def get_posts_for_class(class_id: int) -> list[dict]:
    """
    Return all posts for a class as a threaded structure.
    Each top-level post has a 'replies' list containing its direct replies,
    each of which may also have their own 'replies'.
    """
    conn = get_conn()
    rows = conn.execute("""
        SELECT
            po.id,
            po.parent_post_id,
            po.body,
            po.created_at,
            p.name AS parent_name,
            c.name AS class_name
        FROM posts po
        JOIN participants p ON p.id = po.participant_id
        JOIN classes      c ON c.id = po.class_id
        WHERE po.class_id = ?
        ORDER BY po.created_at;
    """, (class_id,)).fetchall()
    conn.close()
 

    posts_by_id = {}
    for r in rows:
        post = dict(r)
        post["replies"] = []
        posts_by_id[post["id"]] = post
 
    top_level = []
    for post in posts_by_id.values():
        if post["parent_post_id"] is None:
            top_level.append(post)
        else:
            parent = posts_by_id.get(post["parent_post_id"])
            if parent:
                parent["replies"].append(post)
 
    return top_level
 
 
def print_posts(posts: list[dict], indent: int = 0):
    """Pretty-print posts recursively, indenting replies."""
    if not posts:
        if indent == 0:
            print("  (no posts)")
        return
    prefix = "  " + "    " * indent
    for p in posts:
        marker = "↳ " if indent > 0 else ""
        print(f"{prefix}{marker}[{p['id']}] {p['created_at']}  {p['parent_name']}: {p['body']}")
        if p["replies"]:
            print_posts(p["replies"], indent + 1)
 
 
 
if __name__ == "__main__":
    init_db()
    seed()
 
 
