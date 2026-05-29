/*
 * 
 * File:    main.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: React application entry point. Imports global CSS
 *          so design tokens and resets are applied before any
 *          component renders. Mounts the root App component
 *          into the #root div defined in index.html.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-25
 * 
 */


/*  Imports 
   StrictMode:  React wrapper that activates extra development
                warnings and checks in development mode only.
   createRoot:  React 18 API for mounting the app into the DOM.
   index.css:   global stylesheet imported here so all design
                tokens and utility classes are available before
                any component renders.
   App:         the root component that controls which page
                the application displays.
   */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";


/*  Mount the app 
   createRoot targets the <div id="root"> in index.html and
   renders the App component tree inside it.
  */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);