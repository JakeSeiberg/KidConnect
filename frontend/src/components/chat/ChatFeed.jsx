/*
 * 
 * File:    ChatFeed.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: The group chat panel. Fetches posts from
 *          GET /api/classes/:groupId/posts on mount and polls
 *          every 5 seconds. Renders each post as a MessageBubble.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-28
 * 
 */

import { useEffect, useRef, useState } from "react";
import MessageBubble                   from "./MessageBubble";
import MessageInput                    from "./MessageInput";
import styles                          from "./ChatFeed.module.css";

export default function ChatFeed({ groupId, participant }) {

  const [messages, setMessages] = useState([]);
  const feedRef = useRef(null);

  async function loadMessages() {
    try {
      const res  = await fetch(`/api/classes/${groupId}/posts`);
      if (!res.ok) return;
      const data = await res.json();
      // data is a plain array from this endpoint
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      // Silently ignore — the poll will retry in 5 seconds
    }
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleDelete(postId) {
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    setMessages(prev => prev.filter(m => m.id !== postId));
  }

  return (
    <div className={styles.wrapper}>
      <div ref={feedRef} className={styles.feed}>
        <div className={styles.dateSep}>Today</div>

        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.participant_id === participant.id}
            canDelete={participant.role === "teacher"}
            onDelete={() => handleDelete(msg.id)}
          />
        ))}

        {messages.length === 0 && (
          <p className={styles.empty}>
            No messages yet. Say hello to the group!
          </p>
        )}
      </div>

      <MessageInput
        groupId={groupId}
        participant={participant}
        onSent={loadMessages}
      />
    </div>
  );
}