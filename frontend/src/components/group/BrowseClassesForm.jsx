/*
 *
 * File:    BrowseClassesForm.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: Lets a teacher view all existing class groups and
 *          join one by entering their name. Fetches the class
 *          list from GET /api/classes on mount, then POSTs to
 *          POST /api/classes/join with the selected class id
 *          as the join_code and role "teacher".
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-29
 *
 */

import { useEffect, useState } from "react";
import styles from "./BrowseClassesForm.module.css";
import groupStyles from "./GroupForm.module.css";

export default function BrowseClassesForm({ onBack, onJoined }) {

  /* classes — array of { id, name } fetched from the API.
     null while loading, [] if fetch succeeded but no classes. */
  const [classes,      setClasses]      = useState(null);

  /* selectedId — the class the teacher clicked "Join" on.
     null means no class is selected yet.                      */
  const [selectedId,   setSelectedId]   = useState(null);

  /* teacherName — entered in the inline name input that
     appears once a class is selected.                         */
  const [teacherName,  setTeacherName]  = useState("");

  /* error — inline error shown above the confirm button.      */
  const [error,        setError]        = useState("");

  /* loading — true while the join POST is in flight.          */
  const [loading,      setLoading]      = useState(false);

  /* fetchError — shown when the initial class list fails.     */
  const [fetchError,   setFetchError]   = useState("");


  /* Load all classes on mount                                 */
  useEffect(() => {
    async function loadClasses() {
      try {
        const res  = await fetch("/api/classes");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load classes.");
        setClasses(data.classes || []);
      } catch (e) {
        setFetchError(e.message);
        setClasses([]);
      }
    }
    loadClasses();
  }, []);


  /* handleSelect — called when the teacher clicks a class row */
  function handleSelect(id) {
    setSelectedId(id);
    setTeacherName("");
    setError("");
  }


  /* handleJoin — submits the join request for the selected class */
  async function handleJoin(e) {
    e.preventDefault();
    setError("");

    if (!teacherName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/classes/join", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          join_code:  String(selectedId),
          name:       teacherName.trim(),
          child_name: "",          // not applicable for teachers
          role:       "teacher",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      /* Ensure the session knows this user is a teacher       */
      onJoined?.({
        ...data,
        participant: { ...data.participant, role: "teacher" },
      });

    } catch {
      setError("Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }


  /* selectedClass — the full class object for the selected id */
  const selectedClass = classes?.find(c => c.id === selectedId);


  return (
    <div className={groupStyles.screen}>

      <button className="back-link" onClick={onBack}>Back</button>

      <div className="stripe-band" />
      <div className={`card card-striped ${groupStyles.card}`}>

        <h2>Browse classes</h2>
        <p className="subtitle">Select a class to join as a teacher.</p>
        <hr className="hr" />

        {/* ── Loading state ── */}
        {classes === null && !fetchError && (
          <p className={styles.hint}>Loading classes…</p>
        )}

        {/* ── Fetch error ── */}
        {fetchError && (
          <div className="error">{fetchError}</div>
        )}

        {/* ── Empty state ── */}
        {classes !== null && classes.length === 0 && !fetchError && (
          <p className={styles.hint}>
            No classes yet. Create one first!
          </p>
        )}

        {/* ── Class list ── */}
        {classes && classes.length > 0 && (
          <ul className={styles.list}>
            {classes.map(c => (
              <li
                key={c.id}
                className={`${styles.row} ${selectedId === c.id ? styles.selected : ""}`}
                onClick={() => handleSelect(c.id)}
              >
                {/* Class icon + name */}
                <span className={styles.icon}>🏫</span>
                <span className={styles.className}>{c.name}</span>

                {/* Code pill */}
                <span className={styles.codePill}>
                  Code {c.id}
                </span>

                {/* Select indicator */}
                <span className={styles.check}>
                  {selectedId === c.id ? "✓" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* ── Inline join form — appears when a class is selected ── */}
        {selectedId !== null && (
          <form className={styles.joinForm} onSubmit={handleJoin}>
            <hr className="hr" />

            <p className={styles.joinPrompt}>
              Joining <strong>{selectedClass?.name}</strong> — enter your name:
            </p>

            {error && <div className="error">{error}</div>}

            <label htmlFor="browse-teacher-name">Your name</label>
            <input
              id="browse-teacher-name"
              type="text"
              placeholder="e.g. Mr. Thompson"
              value={teacherName}
              onChange={e => setTeacherName(e.target.value)}
              autoFocus
              required
            />

            <button
              type="submit"
              className="btn primary"
              disabled={loading}
            >
              {loading ? "Joining…" : `Join ${selectedClass?.name}`}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}