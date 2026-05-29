/*
 * 
 * File:    JoinGroupForm.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: Form used by parents to join an existing class
 *          group. Collects the join code, the parent's name,
 *          and the child's name. POSTs to /api/classes/join.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-28
 * 
 */

import { useState } from "react";
import styles       from "./GroupForm.module.css";

export default function JoinGroupForm({ onBack, onJoined }) {

  const [code,       setCode]       = useState("");
  const [parentName, setParentName] = useState("");
  const [childName,  setChildName]  = useState("");
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!code.trim() || !parentName.trim() || !childName.trim()) {
      setError("Please fill in all three fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/classes/join", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          join_code:  code.trim(),
          name:       parentName.trim(),
          child_name: childName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Code not recognised. Please check and try again.");
        return;
      }

      onJoined?.(data);

    } catch {
      setError("Could not reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.screen}>
      <button className="back-link" onClick={onBack}>Back</button>
      <div className="stripe-band" />
      <div className={`card card-striped ${styles.card}`}>
        <h2>Join your class</h2>
        <p className="subtitle">Enter the code your teacher gave you.</p>
        <hr className="hr" />

        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}

          <label htmlFor="join-code">Class code</label>
          <input
            id="join-code"
            type="text"
            placeholder="e.g. 3"
            value={code}
            onChange={e => setCode(e.target.value)}
            style={{ letterSpacing: "0.14em", fontWeight: 700 }}
            required
          />

          <label htmlFor="parent-name">Your name</label>
          <input
            id="parent-name"
            type="text"
            placeholder="e.g. Sam Chen"
            value={parentName}
            onChange={e => setParentName(e.target.value)}
            required
          />

          <label htmlFor="child-name">Your child's name</label>
          <input
            id="child-name"
            type="text"
            placeholder="e.g. Lily Chen"
            value={childName}
            onChange={e => setChildName(e.target.value)}
            required
          />

          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Joining..." : "Join group"}
          </button>
        </form>
      </div>
    </div>
  );
}
