/*
 *
 * File:    LandingPage.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: Entry point screen. Shows role buttons (teacher /
 *          parent). Teachers can create a new class or browse
 *          and join an existing one. Parents join via code.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-28
 *
 */

import { useState }      from "react";
import CreateGroupForm   from "../components/group/CreateGroupForm";
import JoinGroupForm     from "../components/group/JoinGroupForm";
import BrowseClassesForm from "../components/group/BrowseClassesForm";
import styles            from "./LandingPage.module.css";

/*
   view values:
     "landing"  — role-select home screen
     "teacher"  — teacher choice: create or browse
     "create"   — teacher creates a new class
     "browse"   — teacher browses existing classes
     "join"     — parent joins via code
*/
export default function LandingPage({ onJoined }) {

  const [view, setView] = useState("landing");

  /* Teacher sub-screen: create */
  if (view === "create") {
    return (
      <CreateGroupForm
        onBack={() => setView("teacher")}
        onCreated={onJoined}
      />
    );
  }

  /* Teacher sub-screen: browse existing classes */
  if (view === "browse") {
    return (
      <BrowseClassesForm
        onBack={() => setView("teacher")}
        onJoined={onJoined}
      />
    );
  }

  /* Parent sub-screen: join via code */
  if (view === "join") {
    return (
      <JoinGroupForm
        onBack={() => setView("landing")}
        onJoined={onJoined}
      />
    );
  }

  /* Teacher choice screen */
  if (view === "teacher") {
    return (
      <div className={styles.screen}>
        <button className="back-link" onClick={() => setView("landing")}>
          Back
        </button>

        <div className="stripe-band" />
        <div className={`card card-striped ${styles.card}`}>

          <div className={styles.logoTitle} style={{ fontSize: "1.4rem" }}>
            Teacher options
          </div>
          <div className={styles.logoSub}>What would you like to do?</div>

          <hr className="hr" />

          <button
            className="btn primary"
            style={{ marginBottom: 10 }}
            onClick={() => setView("browse")}
          >
            Browse &amp; join a class
          </button>

          <button
            className="btn"
            onClick={() => setView("create")}
          >
            Create a new class
          </button>
        </div>
      </div>
    );
  }

  /* Default: role select */
  return (
    <div className={styles.screen}>
      <div className="stripe-band" />
      <div className={`card card-striped ${styles.card}`}>

        <div className={styles.logoTitle}>Kid Connect</div>
        <div className={styles.logoSub}>Your class community</div>

        <hr className="hr" />

        <p className="subtitle" style={{ textAlign: "center", marginBottom: 18 }}>
          Are you a teacher or a parent?
        </p>

        <button
          className="btn primary"
          style={{ marginBottom: 10 }}
          onClick={() => setView("teacher")}
        >
          I am a teacher
        </button>

        <button
          className="btn"
          onClick={() => setView("join")}
        >
          I am a parent
        </button>
      </div>
    </div>
  );
}