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

  const handleConfirmTurn = () => {
    if (!ballHit) {
      setMessage('Select the ball that was hit first.');
      return;
    }

    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];
    const ballsCopy = [...balls];
    //let foul = false;
    let msg = '';

    const currentDeclaredBall = getLowestRemainingBall();
    setDeclaredBall(currentDeclaredBall);

    if (ballHit !== currentDeclaredBall) {
      const foulValue = getBallValue(ballHit);
      player.score -= foulValue;
      msg = `🚨 Foul! Hit ${ballHit} instead of ${currentDeclaredBall}. -${foulValue}`;
      //foul = true;
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
          potted: true, // Always marks as potted regardless of foul
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
        <h1>🎱 Chalkman's Register</h1>
        <input
          type="text"
          placeholder="Enter player name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button onClick={addPlayer}>Add Player</button>
        <button onClick={startGame}>Start Game</button>
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
      <h1>🎱 Chalkman</h1>
      <h2 className="now-playing">Now Playing: {players[currentPlayer].name}</h2>
      <p>Declared Ball: <strong>{declaredBall}</strong></p>
      <p className="message-log">{message}</p>

      <div>
        <h3>👊 Ball Hit</h3>
        <div className="ball-grid">
          {balls.map((ball) => (
            <button
              key={ball.number}
              className={`ball ${ballHit === ball.number ? 'selected' : ''}`}
              onClick={() => setBallHit(ball.number)}
              disabled={ball.potted}
            >
              {ball.number}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3>🎯 Balls Potted</h3>
        <BallBoard
          balls={balls}
          onPot={toggleBallPotted}
          selectedBalls={ballsPotted}
        />
      </div>

      <button onClick={handleConfirmTurn}>✅ Confirm Turn</button>

      <h3>📊 Scoreboard</h3>
      <ul>
        {players.map((p, i) => (
          <li key={i}>
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
