/*
 * 
 * File:    ChatFeed.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: The group chat panel shown on the Chat tab. Fetches
 *          all posts from GET /api/classes/:groupId/posts on
 *          mount and polls every 5 seconds. Renders each post
 *          as a MessageBubble — own messages right in green,
 *          others left in warm white. Teachers see a Delete
 *          button on every bubble. Message input is pinned
 *          to the bottom of this component.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-28
 * 
 */


/*  Imports 
   useEffect:     triggers message loading on mount and sets
                  up the 5-second polling interval.
   useRef:        holds a reference to the scrollable feed div
                  so we can auto-scroll it after new messages.
   useState:      stores the messages array.
   MessageBubble: renders a single message as a styled bubble.
   MessageInput:  the text input bar pinned to the bottom.
   styles:        CSS module scoped to this component.
   */
import { useEffect, useRef, useState } from "react";
import MessageBubble                   from "./MessageBubble";
import MessageInput                    from "./MessageInput";
import styles                          from "./ChatFeed.module.css";


/* 
   COMPONENT: ChatFeed
   Props:
     groupId     — class id used in all API calls
     participant — { id, role } used to determine message
                   ownership and delete button visibility
   */
export default function ChatFeed({ groupId, participant }) {

  /* messages — array of post objects fetched from the API.
     Each: { id, body, created_at, parent_name, participant_id }
     Default: empty array (nothing to render on first load).   */
  const [messages, setMessages] = useState([]);

  /* feedRef — React ref attached to the scrollable message div.
     Used in the auto-scroll effect to set scrollTop after
     new messages arrive.                                      */
  const feedRef = useRef(null);


  /* loadMessages 
     Fetches all posts for this class from the backend and
     updates the messages state. Called on mount and every 5s.
     Errors are caught silently — polling will retry.
    */
//   async function loadMessages() {
//     try {
//       /* GET all posts for this class from the Flask API       */
//       const res  = await fetch(`/api/classes/${groupId}/posts`);
//       const data = await res.json();

//       /* Update state only if the request succeeded            */
//       if (res.ok) setMessages(data);

//     } catch {
//       /* Silently ignore — the poll will retry in 5 seconds    */
//     }
//   }
    async function loadMessages() {
        /* TEMPORARY MOCK — remove when backend is ready */
        setMessages([
            { id: 1, body: "Hi everyone!", created_at: new Date().toISOString(), parent_name: "Maria G.", participant_id: 99 },
            { id: 2, body: "Welcome to the group!", created_at: new Date().toISOString(), parent_name: "Sam C.", participant_id: 99 },
        ]);
    }


  /*  Polling effect 
     Runs once on mount. Calls loadMessages immediately, then
     sets up a 5-second interval. The cleanup function clears
     the interval on unmount to prevent memory leaks.
      */
  useEffect(() => {
    /* Load immediately on mount                               */
    loadMessages();

    /* Poll every 5 seconds for new messages                   */
    const interval = setInterval(loadMessages, 5000);

    /* Clear the interval when the component unmounts          */
    return () => clearInterval(interval);

  }, [groupId]);


  /*  Auto-scroll effect 
     Runs every time messages changes. Scrolls the feed to the
     bottom so the newest message is always visible.
      */
  useEffect(() => {
    /* Only scroll if the ref is attached to the DOM           */
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);


  /*  handleDelete
     Called by a teacher clicking the delete button on a bubble.
     DELETEs the post from the backend and removes it from
     local state immediately for instant UI feedback.
      */
  async function handleDelete(postId) {
    /* Send delete request to the Flask API                    */
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });

    /* Remove the post from state without waiting for next poll */
    setMessages(prev => prev.filter(m => m.id !== postId));
  }


  return (
    <div className={styles.wrapper}>

      {/*  Scrollable message feed 
          feedRef lets the auto-scroll effect control scrollTop */}
      <div ref={feedRef} className={styles.feed}>

        {/* Date separator at the top of the chat feed         */}
        <div className={styles.dateSep}>Today</div>

        {/* One MessageBubble per post in the messages array   */}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            /* isMine — true when the post belongs to the
               current user; controls alignment and color      */
            isMine={msg.participant_id === participant.id}
            /* canDelete — true only for teachers              */
            canDelete={participant.role === "teacher"}
            onDelete={() => handleDelete(msg.id)}
          />
        ))}

        {/* Empty state — only shown when messages array is empty */}
        {messages.length === 0 && (
          <p className={styles.empty}>
            No messages yet. Say hello to the group!
          </p>
        )}
      </div>

      {/*  Message input bar 
          onSent triggers loadMessages after a successful post  */}
      <MessageInput
        groupId={groupId}
        participant={participant}
        onSent={loadMessages}
      />
    </div>
  );
}