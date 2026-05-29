/*
 * 
 * File:    App.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: Root component of the Kid Connect application.
 *          Manages the top-level session state that determines
 *          whether a user is logged in. Renders LandingPage
 *          when no session exists, and GroupPage once a user
 *          (teacher or parent) has successfully joined or
 *          created a class group.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-27
 * 
 */


/*  Imports
   useState:    React hook used to declare session state, which
                controls which page the app renders.
   LandingPage: the entry screen shown when no session exists.
   GroupPage:   the main group screen shown after login.
   index.css:   global design tokens and utility classes.
   */
import { useState }  from "react";
import LandingPage   from "./pages/LandingPage";
import GroupPage     from "./pages/GroupPage";
import "./index.css";


/*  Google Fonts loader 
   Dynamically puts the Google Fonts <link> tag into the
   document <head> so Fredoka and Nunito are available globally.
   Fredoka is used for all headings and labels.
   Nunito is used for body text and inputs.
    */
const fontLink = document.createElement("link");
fontLink.rel   = "stylesheet";
fontLink.href  = "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700&display=swap";
document.head.appendChild(fontLink);


/* 
   COMPONENT: App
   The root component. Holds session state and decides which
   top-level page to render based on whether a session exists.
   */
export default function App() {

  /* session — holds the logged-in user's data after joining.
     null means no user is logged in (default on first load).
     When set, it is an object with two keys:
       group:       { id, name, join_code }
       participant: { id, name, child_name, role }            */
  const [session, setSession] = useState(null);


  /*  handleJoined 
     Called by LandingPage after a successful API response.
     Receives the data object returned from the server and
     stores the group and participant fields in session state,
     which triggers a re-render showing the GroupPage.
     */
  function handleJoined(data) {
    setSession({ group: data.group, participant: data.participant });
  }


  /*  handleLeave 
     Called by GroupPage's back button. Clears the session,
     which triggers a re-render back to the LandingPage.
      */
  function handleLeave() {
    setSession(null);
  }


  /*  Render decision 
     If no session exists, show the landing page.
     If a session exists, show the group page and pass
     the group and participant data as props.
      */
  if (!session) {
    return <LandingPage onJoined={handleJoined} />;
  }

  return (
    <GroupPage
      group={session.group}
      participant={session.participant}
      onLeave={handleLeave}
    />
  );
}