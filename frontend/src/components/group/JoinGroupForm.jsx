/*
 * 
 * File:    JoinGroupForm.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: Form used by parents to join an existing class
 *          group. Collects the join code, the parent's name,
 *          and the child's name. POSTs to /api/classes/join.
 *          Shows a generic error on failure — does not specify
 *          which field was wrong, preventing code enumeration.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-28
 * 
 */


/* Imports 
   useState: React hook to manage all form fields, the error
             message, and the loading guard state.
   styles:   CSS module shared with CreateGroupForm.
 */
import { useState } from "react";
import styles       from "./GroupForm.module.css";


/* 
   COMPONENT: JoinGroupForm
   Props:
     onBack   — callback that returns the user to LandingPage
     onJoined — callback from App that stores the session
                after a successful API response
   */
export default function JoinGroupForm({ onBack, onJoined }) {

  /* code — the join code typed by the parent.
     Stored and displayed in uppercase automatically.
     Default: empty string.                                    */
  const [code, setCode] = useState("");

  /* parentName — the parent's display name shown to the group.
     Default: empty string.                                    */
  const [parentName, setParentName] = useState("");

  /* childName — the child's name stored in the participant record.
     Default: empty string.                                    */
  const [childName, setChildName] = useState("");

  /* error — inline error message shown above the submit button.
     Default: empty string (no error shown).                   */
  const [error, setError] = useState("");

  /* loading — true while the fetch request is in flight.
     Prevents double-submission. Default: false.               */
  const [loading, setLoading] = useState(false);


  /*  handleSubmit 
     Validates all three fields are filled, then POSTs to
     /api/classes/join. Passes response data to App via
     onJoined on success. Shows a generic error on failure.
      */
  async function handleSubmit(e) {

    /* Prevent browser page reload on form submit              */
    e.preventDefault();

    /* Clear any error from a previous attempt                 */
    setError("");

    /* Validate — all three fields must be filled             */
    if (!code.trim() || !parentName.trim() || !childName.trim()) {
      setError("Please fill in all three fields.");
      return;
    }

    /* Show loading state to disable the button               */
    setLoading(true);

    /*try {
      
      const res = await fetch("/api/classes/join", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          join_code:  code.trim().toUpperCase(),
          name:       parentName.trim(),
          child_name: childName.trim(),
        }),
      });
    */
    try {
        /* TEMPORARY MOCK — remove when backend is ready */
        const fakeData = {
            group: { id: 1, name: "Sun Room 302", join_code: code },
            participant: { id: 2, name: parentName, child_name: childName, role: "parent" },
        };
        onJoined?.(fakeData);
      /* Parse the response body                              */
      const data = await res.json();

      /* Generic error — do not reveal which field was wrong  */
      if (!res.ok) {
        setError(data.error || "Code not recognised. Please check and try again.");
        return;
      }

      /* Pass the session data up to App                      */
      onJoined?.(data);

    } catch {
      /* Handle network failures                              */
      setError("Could not reach the server. Please check your connection.");

    } finally {
      /* Re-enable the button regardless of outcome           */
      setLoading(false);
    }
  }


  /*  Form view 
     Three inputs and a join button.
      */
  return (
    <div className={styles.screen}>

      {/* Back link — returns to the landing page             */}
      <button className="back-link" onClick={onBack}>Back</button>

      <div className="stripe-band" />
      <div className={`card card-striped ${styles.card}`}>
        <h2>Join your class</h2>
        <p className="subtitle">Enter the code your teacher gave you.</p>
        <hr className="hr" />

        <form onSubmit={handleSubmit}>

          {/* Inline error — only rendered when error is set  */}
          {error && <div className="error">{error}</div>}

          {/* Join code — forced uppercase, wide letter-spacing */}
          <label htmlFor="join-code">Class code</label>
          <input
            id="join-code"
            type="text"
            placeholder="e.g. SUNF42"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700 }}
            required
          />

          {/* Parent's display name                           */}
          <label htmlFor="parent-name">Your name</label>
          <input
            id="parent-name"
            type="text"
            placeholder="e.g. Sam Chen"
            value={parentName}
            onChange={e => setParentName(e.target.value)}
            required
          />

          {/* Child's name stored in the participant record   */}
          <label htmlFor="child-name">Your child's name</label>
          <input
            id="child-name"
            type="text"
            placeholder="e.g. Lily Chen"
            value={childName}
            onChange={e => setChildName(e.target.value)}
            required
          />

          {/* Submit button — shows "Joining..." while loading */}
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Joining..." : "Join group"}
          </button>
        </form>
      </div>
    </div>
  );
}