/*
 * 
 * File:    GroupHeader.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: Persistent header bar at the top of GroupPage.
 *          Shows the class name, the logged-in user's name,
 *          and a Back button. If the user is a teacher, also
 *          shows a small badge with the class join code so
 *          the teacher can reference it without leaving.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-28
 * 
 */


/* Imports
   styles: CSS module scoped to this component. Provides the
           header bar, back button, and code badge styles.
   */
import styles from "./GroupHeader.module.css";


/* 
   COMPONENT: GroupHeader
   Props:
     group       — { id, name, join_code }
     participant — { id, name, role }
     onLeave     — callback that clears the session in App
   */
export default function GroupHeader({ group, participant, onLeave }) {

  return (
    <header className={styles.header}>

      {/* Back button — calls onLeave to clear session        */}
      <button className={styles.backBtn} onClick={onLeave}>
        Back
      </button>

      {/* Info column — class name above, user name below     */}
      <div className={styles.info}>

        {/* Class name in large white Fredoka text             */}
        <div className={styles.classTitle}>{group.name}</div>

        {/* User name row — includes code badge for teachers   */}
        <div className={styles.memberName}>

          {/* Logged-in participant's display name             */}
          {participant.name}

          {/* Code badge — only rendered when role is teacher  */}
          {participant.role === "teacher" && (
            <span className={styles.codeBadge}>
              Code: {group.join_code}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}