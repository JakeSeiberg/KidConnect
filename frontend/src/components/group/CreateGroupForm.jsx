/*
 * 
 * File:    CreateGroupForm.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: Form used by teachers to create a new class group.
 *          Collects a group name and the teacher's name, POSTs
 *          to /api/classes, and displays the auto-generated
 *          join code on success so the teacher can share it.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-28
 * 
 */

import { useState } from "react";
import styles       from "./GroupForm.module.css";

export default function CreateGroupForm({ onBack, onCreated }) {

  const [className,      setClassName]      = useState("");
  const [teacherName,    setTeacherName]    = useState("");
  const [generatedCode,  setGeneratedCode]  = useState(null);
  const [error,          setError]          = useState("");
  const [loading,        setLoading]        = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!className.trim() || !teacherName.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/classes", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:         className.trim(),
          teacher_name: teacherName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setGeneratedCode(data.join_code);
      onCreated?.(data);

    } catch {
      setError("Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  if (generatedCode) {
    return (
      <div className={styles.screen}>
        <div className="stripe-band" />
        <div className={`card card-striped ${styles.card}`}>
          <div className={styles.codeTitle}>Class created!</div>
          <p className="subtitle">Share this code with parents:</p>
          <div className={styles.codeBox}>
            <div className={styles.codeLabel}>Join code</div>
            <div className={styles.codeValue}>{generatedCode}</div>
            <div className={styles.codeHint}>
              Parents enter this code to join your class
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <button className="back-link" onClick={onBack}>Back</button>
      <div className="stripe-band" />
      <div className={`card card-striped ${styles.card}`}>
        <h2>Create a class group</h2>
        <p className="subtitle">Set up a board for your class parents.</p>
        <hr className="hr" />

        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}

          <label htmlFor="admin-class-name">Name of group</label>
          <input
            id="admin-class-name"
            type="text"
            placeholder="e.g. Sunflower Room 2026"
            value={className}
            onChange={e => setClassName(e.target.value)}
            required
          />

          <label htmlFor="admin-name">Your name</label>
          <input
            id="admin-name"
            type="text"
            placeholder="e.g. Ms. Rivera"
            value={teacherName}
            onChange={e => setTeacherName(e.target.value)}
            required
          />

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Creating..." : "Create group"}
          </button>
        </form>
      </div>
    </div>
  );
}
