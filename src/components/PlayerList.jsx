// src/components/PlayerList.jsx
import React from "react";

export default function PlayerList({ players, scores, currentTurn, eliminated }) {
  return (
    <div>
      <h2>Players</h2>
      <ul>
        {players.map((p, i) => (
          <li
            key={i}
            style={{
              fontWeight: i === currentTurn ? "bold" : "normal",
              textDecoration: eliminated.includes(p) ? "line-through" : "none",
            }}
          >
            {p}: {scores[p] || 0} pts {i === currentTurn ? "← Turn" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
