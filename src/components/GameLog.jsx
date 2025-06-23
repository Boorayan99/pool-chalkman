// src/components/GameLog.jsx
import React from "react";

export default function GameLog({ entries }) {
  return (
    <div>
      <h2>Game Log</h2>
      <ul style={{ maxHeight: "200px", overflowY: "scroll" }}>
        {entries.map((entry, idx) => (
          <li key={idx}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}
