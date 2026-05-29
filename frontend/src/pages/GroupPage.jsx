/*
 * 
 * File:    GroupPage.jsx
 * System:  Kid Connect — Parent Communication Platform
 * Purpose: Main group view rendered after a user joins or
 *          creates a class group. Displays a persistent header
 *          bar, a two-tab bar (Chat and Events), and whichever
 *          panel the active tab controls: ChatFeed for messages
 *          or EventList for posted events.
 * Authors: Abby Appling, Reid Allenstein, Ben Elster, Jacob Seiberg
 * Created: 2026-05-28
 * 
 */


/* Imports 
   useState:    React hook used to track which tab is active.
   GroupHeader: the dark green header bar with class name
                and the back button.
   ChatFeed:    the scrollable group chat panel, rendered
                when tab === "chat".
   styles:      CSS module scoped to this component.
    */
import { useState }  from "react";
import GroupHeader   from "../components/group/GroupHeader";
import ChatFeed      from "../components/chat/ChatFeed";
import styles        from "./GroupPage.module.css";


/* 
   COMPONENT: GroupPage
   Props:
     group       — { id, name, join_code } for the active class
     participant — { id, name, child_name, role } for the user
     onLeave     — callback that clears the session in App
    */
export default function GroupPage({ group, participant, onLeave }) {


  return (
  <div className={styles.page}>

    {/* Group header — persistent top bar with class name and back button */}
    <GroupHeader
      group={group}
      participant={participant}
      onLeave={onLeave}
    />

    {/* Chat feed — fills all remaining space below the header */}
    <ChatFeed groupId={group.id} participant={participant} />

  </div>
);
}