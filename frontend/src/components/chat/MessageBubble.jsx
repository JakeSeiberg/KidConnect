/*
 * 
 * File:    MessageBubble.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: Renders a single chat message as a styled bubble.
 *          Own messages are right-aligned with a green filled
 *          bubble. Others are left-aligned with a warm white
 *          dashed bubble. Both show sender name and timestamp.
 *          Teachers also see a small Delete button.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-28
 * 
 */


/*  Imports 
   styles: CSS module providing .msg, .mine, .theirs, .bubble,
           .sender, .meta, .timestamp, and .deleteBtn.
    */
import styles from "./MessageBubble.module.css";


/* 
   COMPONENT: MessageBubble
   Props:
     message   — { id, body, created_at, parent_name }
     isMine    — true when the message belongs to current user
     canDelete — true only when the current user is a teacher
     onDelete  — callback fired when delete button is clicked
    */
export default function MessageBubble({ message, isMine, canDelete, onDelete }) {

  /* time — the send time formatted as HH:MM AM/PM.
     Parsed from the ISO timestamp string in message.created_at. */
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour:   "2-digit",
    minute: "2-digit",
  });


  return (
    /* Root div — styles.mine for right-aligned, .theirs for left */
    <div className={`${styles.msg} ${isMine ? styles.mine : styles.theirs}`}>

      {/* Sender name above the bubble.
          "You" for own messages; actual name for others.      */}
      <div className={styles.sender}>
        {isMine ? "You" : message.parent_name}
      </div>

      {/* Message body inside the styled bubble                */}
      <div className={styles.bubble}>{message.body}</div>

      {/* Meta row — timestamp and optional delete button      */}
      <div className={styles.meta}>

        {/* Formatted timestamp                                */}
        <span className={styles.timestamp}>{time}</span>

        {/* Delete button — only rendered when canDelete true  */}
        {canDelete && (
          <button className={styles.deleteBtn} onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}