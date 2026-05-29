/*
 * 
 * File:    LandingPage.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: Entry point screen of the application. Displays
 *          the Kid Connect logo, tagline, and two role buttons.
 *          Clicking "I am a teacher" navigates to the
 *          CreateGroupForm. Clicking "I am a parent" navigates
 *          to the JoinGroupForm. Manages the view state that
 *          controls which sub-screen to render.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-28
 * 
 */


/* Imports 
   useState:        React hook used to track which sub-screen
                    is currently visible.
   CreateGroupForm: the teacher's class creation form, shown
                    when view === "create".
   JoinGroupForm:   the parent's join form, shown when
                    view === "join".
   styles:          CSS module scoped to this component.
    */
import { useState }      from "react";
import CreateGroupForm   from "../components/group/CreateGroupForm";
import JoinGroupForm     from "../components/group/JoinGroupForm";
import styles            from "./LandingPage.module.css";


/* 
   COMPONENT: LandingPage
   Props:
     onJoined — callback from App, called after a successful
                create or join so App can store the session.
    */
export default function LandingPage({ onJoined }) {

  /* view — controls which sub-screen is rendered.
     "landing" shows the two role buttons (default).
     "create"  shows the teacher create-group form.
     "join"    shows the parent join-with-code form.           */
  const [view, setView] = useState("landing");


  /*  Teacher path 
     Render CreateGroupForm when view is "create".
     onBack returns to the landing buttons.
     onCreated calls the App callback to store the session.
      */
  if (view === "create") {
    return (
      <CreateGroupForm
        onBack={() => setView("landing")}
        onCreated={onJoined}
      />
    );
  }


  /*  Parent path 
     Render JoinGroupForm when view is "join".
     onBack returns to the landing buttons.
     onJoined calls the App callback to store the session.
      */
  if (view === "join") {
    return (
      <JoinGroupForm
        onBack={() => setView("landing")}
        onJoined={onJoined}
      />
    );
  }


  /*  Default landing view 
     Renders the logo card with the two role buttons.
     */
  return (
    <div className={styles.screen}>

      {/* Striped band sits flush above the card               */}
      <div className="stripe-band" />

      <div className={`card card-striped ${styles.card}`}>

        {/* App name in large Fredoka heading                  */}
        <div className={styles.logoTitle}>Kid Connect</div>

        {/* Tagline below the logo                             */}
        <div className={styles.logoSub}>Your class community</div>

        {/* Dotted divider between logo and buttons            */}
        <hr className="hr" />

        {/* Role selection prompt                              */}
        <p className="subtitle" style={{ textAlign: "center", marginBottom: 18 }}>
          Are you a teacher or a parent?
        </p>

        {/* Teacher button — navigates to create-group form    */}
        <button
          className="btn primary"
          style={{ marginBottom: 10 }}
          onClick={() => setView("create")}
        >
          I am a teacher
        </button>

        {/* Parent button — navigates to join-with-code form   */}
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