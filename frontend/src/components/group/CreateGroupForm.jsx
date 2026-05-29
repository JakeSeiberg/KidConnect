/*
 * 
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: Form used by teachers to create a new class group.
 *          Collects a group name and the teacher's name, POSTs
 *          to /api/classes, and displays the auto-generated
 *          join code on success so the teacher can share it.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-28
 * 
 */


/* Imports 
   useState: React hook used to manage all form field values,
             the generated join code, error messages, and the
             loading state while the API request is in flight.
   styles:   CSS module shared with JoinGroupForm.
    */
import { useState } from "react";
import styles       from "./GroupForm.module.css";


/* 
   COMPONENT: CreateGroupForm
   Props:
     onBack    — callback that returns the user to LandingPage
     onCreated — callback from App that stores the session
                 after a successful API response
   */
export default function CreateGroupForm({ onBack, onCreated }) {

  /* className — the name of the class group being created.
     Default: empty string (blank on first render).           */
  const [className, setClassName] = useState("");

  /* teacherName — the teacher's display name.
     Default: empty string.                                   */
  const [teacherName, setTeacherName] = useState("");

  /* generatedCode — the join code returned by the server.
     null until the API responds. When set, the success
     screen renders instead of the form.                      */
  const [generatedCode, setGeneratedCode] = useState(null);

  /* error — the error message shown inline above the button.
     Default: empty string (no error shown).                  */
  const [error, setError] = useState("");

  /* loading — true while the fetch request is in flight.
     Disables the submit button to prevent double-submission.
     Default: false.                                          */
  const [loading, setLoading] = useState(false);


  /* handleSubmit 
     Validates both fields are filled, then POSTs to
     /api/classes. On success, stores the join code returned
     by the server and notifies the parent component via
     onCreated. On failure, shows an inline error message.
      */
  async function handleSubmit(e) {

    /* Prevent the browser from reloading the page on submit  */
    e.preventDefault();

    /* Clear any error from a previous failed attempt         */
    setError("");

    /* Validate — both fields must be non-empty               */
    if (!className.trim() || !teacherName.trim()) {
      setError("Please fill in both fields.");
      return;
    }

    /* Show loading state to disable the button               */
    setLoading(true);

    // try {
    //   /* POST to the Flask create-class endpoint              */
    //   const res = await fetch("/api/classes", {
    //     method:  "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body:    JSON.stringify({
    //       name:         className.trim(),
    //       teacher_name: teacherName.trim(),
    //     }),
    //   });
    try {
        /* TEMPORARY MOCK — remove when backend is ready */
        const fakeData = {
            join_code: "SUNF42",
            group: { id: 1, name: className, join_code: "SUNF42" },
            participant: { id: 1, name: teacherName, role: "teacher" },
        };
        setGeneratedCode(fakeData.join_code);
        onCreated?.(fakeData);

      /* Parse the JSON response body                         */
      const data = await res.json();

      /* If server returned a non-2xx status, show the error  */
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      /* Store the generated join code to show success screen */
      setGeneratedCode(data.join_code);

      /* Notify App to store the session and render GroupPage  */
      onCreated?.(data);

    } catch {
      /* Handle network failures or unexpected errors          */
      setError("Could not reach the server. Please check your connection.");

    } finally {
      /* Always re-enable the submit button after the request */
      setLoading(false);
    }
  }


  /*  Success screen 
     Shown after a successful group creation. Displays the
     join code in a large dotted box for the teacher to share.
      */
  if (generatedCode) {
    return (
      <div className={styles.screen}>
        <div className="stripe-band" />
        <div className={`card card-striped ${styles.card}`}>

          {/* Success heading                                  */}
          <div className={styles.codeTitle}>Class created!</div>

          {/* Instruction to share the code with parents       */}
          <p className="subtitle">Share this code with parents:</p>

          {/* Large dotted box displaying the join code        */}
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


  /*  Default form view 
     Two text inputs and a submit button.
      */
  return (
    <div className={styles.screen}>

      {/* Back link — returns to the landing page              */}
      <button className="back-link" onClick={onBack}>Back</button>

      <div className="stripe-band" />
      <div className={`card card-striped ${styles.card}`}>
        <h2>Create a class group</h2>
        <p className="subtitle">Set up a board for your class parents.</p>
        <hr className="hr" />

        <form onSubmit={handleSubmit}>

          {/* Inline error — only rendered when error is set   */}
          {error && <div className="error">{error}</div>}

          {/* Group name input                                 */}
          <label htmlFor="admin-class-name">Name of group</label>
          <input
            id="admin-class-name"
            type="text"
            placeholder="e.g. Sunflower Room 2026"
            value={className}
            onChange={e => setClassName(e.target.value)}
            required
          />

          {/* Teacher name input                               */}
          <label htmlFor="admin-name">Your name</label>
          <input
            id="admin-name"
            type="text"
            placeholder="e.g. Ms. Rivera"
            value={teacherName}
            onChange={e => setTeacherName(e.target.value)}
            required
          />

          {/* Submit button — shows "Creating..." while loading */}
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? "Creating..." : "Create group"}
          </button>
        </form>
      </div>
    </div>
  );
}