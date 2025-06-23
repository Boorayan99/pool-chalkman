// BallBoard.jsx
import React from 'react';
import './BallBoard.css';

export default function BallBoard({ balls, onPot, selectedBalls }) {
  return (
    <div className="ball-board">
      {balls.map((ball) => (
        <button
          key={ball.number}
          className={`ball ${selectedBalls.includes(ball.number) ? 'selected' : ''}`}
          onClick={() => onPot(ball.number)}
          disabled={ball.potted}
        >
          {ball.number}
        </button>
      ))}
    </div>
  );
}
