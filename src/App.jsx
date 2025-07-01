// App.jsx
import React, { useState } from 'react';
import BallBoard from './components/BallBoard';
import './App.css';

const BALL_NUMBERS = Array.from({ length: 15 }, (_, i) => i + 1);
const getBallValue = (num) => {
  if (num === 1) return 16;
  if (num === 2) return 17;
  if (num >= 3 && num <= 6) return 6;
  return num;
};

export default function App() {
  const [setupPhase, setSetupPhase] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [balls, setBalls] = useState(
    BALL_NUMBERS.map((num) => ({ number: num, value: getBallValue(num), potted: false }))
  );
  const [message, setMessage] = useState('');
  const [declaredBall, setDeclaredBall] = useState(null);
  const [ballHit, setBallHit] = useState(null);
  const [ballsPotted, setBallsPotted] = useState([]);
  const [history, setHistory] = useState([]);

  const getLowestRemainingBall = () => {
    const remainingBalls = balls.filter((b) => !b.potted);
    const minValue = Math.min(...remainingBalls.map((b) => b.value));
    const lowestBall = remainingBalls.find((b) => b.value === minValue);
    return lowestBall?.number;
  };

  const addPlayer = () => {
    if (playerName.trim() && players.length < 10) {
      setPlayers([...players, { name: playerName.trim(), score: 0, eliminated: false }]);
      setPlayerName('');
    }
  };

  const startGame = () => {
    if (players.length >= 2) {
      setDeclaredBall(getLowestRemainingBall());
      setSetupPhase(false);
    } else {
      setMessage('At least 2 players required.');
    }
  };

  const toggleBallPotted = (number) => {
    if (balls.find((b) => b.number === number)?.potted) return;
    if (ballsPotted.includes(number)) {
      setBallsPotted(ballsPotted.filter((n) => n !== number));
    } else {
      setBallsPotted([...ballsPotted, number]);
    }
  };

  const handleMissedShot = () => {
    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];
    const missValue = getBallValue(declaredBall);
    player.score -= missValue;
    setPlayers(updatedPlayers);
    setMessage(`❌ Missed Shot! -${missValue} points`);
    checkElimination(updatedPlayers, balls);
    checkWinner(balls);
    nextTurn(balls);
  };

  const handleConfirmTurn = () => {
    if (!ballHit) {
      setMessage('Select the ball that was hit first.');
      return;
    }
    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];
    const ballsCopy = [...balls];
    let msg = '';
    const currentDeclaredBall = getLowestRemainingBall();
    setDeclaredBall(currentDeclaredBall);

    const isFirstShot = history.length === 0 && currentDeclaredBall === 3;
    const pottedCueBall = ballHit === 0;

    if (isFirstShot && pottedCueBall) {
      msg = '⚪ Cue ball potted on break. No penalty.';
    } else if (ballHit !== currentDeclaredBall) {
      const foulValue = getBallValue(ballHit);
      player.score -= foulValue;
      msg = `🚨 Foul! Hit ${ballHit} instead of ${currentDeclaredBall}. -${foulValue}`;
    } else if (ballsPotted.length === 0) {
      msg = `⚠️ No balls potted. No score.`;
    } else {
      const earned = ballsPotted.reduce((sum, num) => sum + getBallValue(num), 0);
      player.score += earned;
      msg = `✅ Nice shot! +${earned} points`;
    }

    ballsCopy.forEach((b, i) => {
      if (ballsPotted.includes(b.number)) {
        ballsCopy[i] = {
          ...b,
          potted: true,
        };
      }
    });

    setBalls(ballsCopy);
    setPlayers(updatedPlayers);
    setMessage(msg);
    setBallHit(null);
    setBallsPotted([]);

    setHistory((prev) => [
      {
        player: players[currentPlayer].name,
        hit: ballHit,
        potted: [...ballsPotted],
        message: msg,
        score: players[currentPlayer].score,
      },
      ...prev,
    ]);

    checkElimination(updatedPlayers, ballsCopy);
    checkWinner(ballsCopy);
    nextTurn(updatedPlayers);
  };

  const checkElimination = (updatedPlayers, updatedBalls) => {
    const remaining = updatedBalls.filter((b) => !b.potted);
    const maxRemaining = remaining.reduce((sum, b) => sum + b.value, 0);
    const maxScore = Math.max(...updatedPlayers.map((p) => p.score));

    const reviewed = updatedPlayers.map((p) => {
      const canCatch = p.score + maxRemaining >= maxScore;
      return { ...p, eliminated: !canCatch };
    });

    setPlayers(reviewed);
  };

  const checkWinner = (updatedBalls) => {
    const remaining = updatedBalls.filter((b) => !b.potted);
    if (remaining.length === 0) {
      const alive = players.filter((p) => !p.eliminated);
      const winner = alive.sort((a, b) => b.score - a.score)[0];
      setMessage(`🏆 Game Over! Winner: ${winner.name} (${winner.score} pts)`);
    }
  };

  const nextTurn = () => {
    const total = players.length;
    let next = (currentPlayer + 1) % total;
    let loops = 0;

    while (players[next].eliminated && loops < total) {
      next = (next + 1) % total;
      loops++;
    }

    setCurrentPlayer(next);
    setDeclaredBall(getLowestRemainingBall());
  };

  if (setupPhase) {
    return (
      <div className="app-container">
        <h1>🎱Registration</h1>
        <input
          type="text"
          placeholder="Add Player"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <div className="start-buttons">
          <button onClick={addPlayer}>Add Players</button>
          <button onClick={startGame}>Start Game</button>
        </div>
        <ul>
          {players.map((p, i) => (
            <li key={i}>{p.name}</li>
          ))}
        </ul>
        <p className="message-error">{message}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h2>🎱 Chalkman</h2>
      <h2 className="now-playing">Now Playing: {players[currentPlayer].name}</h2>
      <p>Declared Ball: <strong>{declaredBall}</strong></p>
      <p className="message-log">{message}</p>

      <div className="ball-section">
        <h3>👊 Ball Hit</h3>
        <div className="ball-grid">
          {balls.map((ball) => (
            <button
              key={ball.number}
              className={`ball ${ballHit === ball.number ? 'selected' : ''}`}
              onClick={() => setBallHit(ball.number)}
              disabled={ball.potted}
              data-number={ball.number}
            >
              {ball.number}
            </button>
          ))}
        </div>
        <div className="ball-actions stacked">
          <button onClick={handleMissedShot}>❌ Missed Shot</button>
          
        </div>
      </div>

      <div className="potted-section">
        <h3>🎯 Balls Potted</h3>
        <div className="ball-board-grid">
          {balls.map((ball) => (
            <button
              key={ball.number}
              className={`potted-ball ${ballsPotted.includes(ball.number) ? 'selected' : ''}`}
              data-number={ball.number}
              onClick={() => toggleBallPotted(ball.number)}
              disabled={ball.potted}
            >
              {ball.number}
            </button>
          ))}
        </div>
        <div className="ball-actions">
          <button onClick={handleConfirmTurn}>✅ Confirm Turn</button>
        </div>
      </div>

      <h3>📊 Scoreboard</h3>
      <ul className="scoreboard">
        {players.map((p, i) => (
          <li key={i} className={p.eliminated ? 'eliminated' : ''}>
            {p.name}: {p.score} {p.eliminated && '❌ Eliminated'}
          </li>
        ))}
      </ul>

      <h3>📜 Turn History</h3>
      <ul className="history-log">
        {history.map((log, index) => (
          <li key={index}>
            <strong>{log.player}</strong> hit <strong>{log.hit}</strong>,
            potted: [{log.potted.join(', ') || 'none'}] →
            <em>{log.message}</em> (Score: {log.score})
          </li>
        ))}
      </ul>
    </div>
  );
}
