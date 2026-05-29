/*
 * 
 * File:    MessageInput.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: Message input bar pinned to the bottom of ChatFeed.
 *          Accepts text, POSTs to /api/classes/:groupId/posts,
 *          then calls onSent to trigger a feed refresh. Supports
 *          both the Send button and the Enter key. A loading
 *          guard prevents double-submission.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-28
 * 
 */


/*  Imports 
   useState: manages the input text and the sending guard.
   styles:   CSS module for the bar, input, and send button.
    */
import { useState } from "react";
import styles       from "./MessageInput.module.css";


/* 
   COMPONENT: MessageInput
   Props:
     groupId     — class id used in the POST URL
     participant — { id } used to associate the post with
                   the correct participant record
     onSent      — callback called after a successful POST
                   so ChatFeed can reload the message list
    */
export default function MessageInput({ groupId, participant, onSent }) {

  /* body — the text currently typed in the input.
     Cleared after each successful send. Default: empty.       */
  const [body, setBody] = useState("");

  /* sending — true while the POST is in flight.
     Prevents double-submission. Default: false.               */
  const [sending, setSending] = useState(false);


  /*  handleSend 
     Called on form submit (button or Enter key). Validates
     the body is not empty, POSTs the message, clears the
     input, and calls onSent on success. Errors are caught
     silently — the user can retry by pressing Send again.
      */
  async function handleSend(e) {

    /* Prevent the form from reloading the page                */
    e.preventDefault();

    /* Do not send if blank or a request is already in flight  */
    if (!body.trim() || sending) return;

    /* Disable the button while the request is in flight       */
    setSending(true);

    try {
      /* POST the message to the Flask API                     */
      await fetch(`/api/classes/${groupId}/posts`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          participant_id: participant.id,
          body:           body.trim(),
        }),
      });

      /* Clear the input after a successful send               */
      setBody("");

      /* Trigger a message list refresh in ChatFeed            */
      onSent?.();

    } catch {
      /* Silently ignore — user can press Send again           */

    } finally {
      /* Re-enable the button regardless of outcome            */
      setSending(false);
    }
  }


  return (
    /* Form wrapping input + button so Enter key fires onSubmit */
    <form className={styles.bar} onSubmit={handleSend}>

      {/* Text input — grows to fill all remaining width       */}
      <input
        type="text"
        className={styles.input}
        placeholder="Message the group..."
        value={body}
        onChange={e => setBody(e.target.value)}
        maxLength={1000}
      />

      {/* Send button — disabled when sending or input empty   */}
      <button
        type="submit"
        className={styles.sendBtn}
        disabled={sending || !body.trim()}
      >
        Send
      </button>
    </form>
  );
}