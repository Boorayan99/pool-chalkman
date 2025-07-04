// App.jsx — Cleaned and Refined Version
import React, { useState } from "react";
import BallBoard from "./components/BallBoard";
import "./App.css";

const BALL_NUMBERS = Array.from({ length: 15 }, (_, i) => i + 1);
const getBallValue = (num) => {
  if (num === 1) return 16;
  if (num === 2) return 17;
  if (num >= 3 && num <= 6) return 6;
  return num;
};

export default function App() {
  const [setupPhase, setSetupPhase] = useState(true);
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [balls, setBalls] = useState(
    BALL_NUMBERS.map((num) => ({ number: num, value: getBallValue(num), potted: false }))
  );
  const [message, setMessage] = useState("");
  const [ballHit, setBallHit] = useState(null);
  const [ballsPotted, setBallsPotted] = useState([]);
  const [history, setHistory] = useState([]);
  const [isFirstBallYetPotted, setIsFirstBallYetPotted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const getLowestRemainingBall = () => {
    const remaining = balls.filter((b) => !b.potted);
    const minVal = Math.min(...remaining.map((b) => b.value));
    return remaining.find((b) => b.value === minVal)?.number;
  };

  const addPlayer = () => {
    if (playerName.trim() && players.length < 10) {
      setPlayers([...players, { name: playerName.trim(), score: 0, eliminated: false }]);
      setPlayerName("");
    }
  };

  const startGame = () => {
    if (players.length >= 2) setSetupPhase(false);
    else setMessage("At least 2 players required.");
  };

  const toggleBallPotted = (number) => {
    if (number !== 0 && balls.find((b) => b.number === number)?.potted) return;
    setBallsPotted((prev) =>
      prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
    );
  };

  const handleMissedShot = () => {
    const declared = getLowestRemainingBall();
    const penalty = getBallValue(declared);

    const updated = [...players];
    updated[currentPlayer].score -= penalty;

    const log = {
      player: updated[currentPlayer].name,
      hit: 0,
      potted: [],
      message: `❌ Missed Shot! -${penalty} points for failing to hit Ball ${declared}`,
      score: updated[currentPlayer].score,
    };

    setHistory((prev) => [log, ...prev]);
    setPlayers(updated);
    setMessage(log.message);

    const reviewed = checkElimination(updated, balls);
    nextTurn(reviewed);
  };

  const handleConfirmTurn = () => {
    if (ballHit === null) {
      setMessage("Select the ball that was hit first.");
      return;
    }

    const updated = [...players];
    const player = updated[currentPlayer];
    const declared = ballHit;
    const cueBallPotted = ballsPotted.includes(0);
    const declaredBallPotted = ballsPotted.includes(declared);
    const declaredValue = getBallValue(declared);

    let score = ballsPotted
      .filter((n) => n !== 0 && n !== declared)
      .reduce((sum, num) => sum + getBallValue(num), 0);

    if (!isFirstBallYetPotted) {
      if (!cueBallPotted && declaredBallPotted) score += declaredValue;
      if (ballsPotted.some((n) => n !== 0)) setIsFirstBallYetPotted(true);
    } else {
      if (cueBallPotted && declaredBallPotted) {
        score += declaredValue - declaredValue;
      } else if (cueBallPotted) {
        score -= declaredValue;
      } else if (declaredBallPotted) {
        score += declaredValue;
      }
    }

    player.score += score;

    const updatedBalls = balls.map((b) =>
      ballsPotted.includes(b.number) ? { ...b, potted: true } : b
    );

    const log = {
      player: player.name,
      hit: declared,
      potted: [...ballsPotted],
      message: cueBallPotted
        ? declaredBallPotted
          ? `⚠️ Cue and declared ball potted. +${declaredValue} -${declaredValue} = 0. Total: ${score}`
          : `⚠️ Cue ball potted. -${declaredValue}. Total: ${score}`
        : `✅ Turn Complete. Score: ${score}`,
      score: player.score,
    };

    setPlayers(updated);
    setBalls(updatedBalls);
    setHistory((prev) => [log, ...prev]);
    setBallHit(null);
    setBallsPotted([]);
    setMessage(log.message);

    const reviewed = checkElimination(updated, updatedBalls);
    nextTurn(reviewed);
  };

  const checkElimination = (updatedPlayers, updatedBalls) => {
    const remaining = updatedBalls.filter((b) => !b.potted);
    const maxRemaining = remaining.reduce((sum, b) => sum + b.value, 0);
    const maxScore = Math.max(...updatedPlayers.map((p) => p.score));

    const reviewed = updatedPlayers.map((p) => ({
      ...p,
      eliminated: p.score + maxRemaining < maxScore,
    }));

    const alive = reviewed.filter((p) => !p.eliminated);
    if (alive.length === 1) {
      setMessage(`🏆 Game Over! Winner: ${alive[0].name} (${alive[0].score} pts)`);
      setGameOver(true);
    }

    setPlayers(reviewed);
    return reviewed;
  };

  const nextTurn = (list = players) => {
    const total = list.length;
    for (let i = 1; i <= total; i++) {
      const idx = (currentPlayer + i) % total;
      if (!list[idx].eliminated) {
        setCurrentPlayer(idx);
        return;
      }
    }
    setCurrentPlayer(null);
    setMessage("🎉 Game Over!");
  };

  const handleDownloadLog = () => {
    const logText = history
      .map((log, i) => `Turn ${history.length - i}:\nPlayer: ${log.player}\nHit: ${log.hit}\nPotted: ${log.potted.join(", ") || "none"}\nMessage: ${log.message}\nScore: ${log.score}\n`)
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pool_game_log.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetGame = () => {
    setSetupPhase(true);
    setPlayerName("");
    setPlayers([]);
    setCurrentPlayer(0);
    setBalls(BALL_NUMBERS.map((n) => ({ number: n, value: getBallValue(n), potted: false })));
    setMessage("");
    setBallHit(null);
    setBallsPotted([]);
    setHistory([]);
    setIsFirstBallYetPotted(false);
    setGameOver(false);
  };

  if (setupPhase) {
    return (
      <div className="app-container">
        <h2>🎱 Chalkboard</h2>
        <input
          type="text"
          placeholder="Add Players"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <div className="start-buttons">
          <button onClick={addPlayer}>Register</button>
          <button onClick={startGame}>Start</button>
        </div>
        <ul>{players.map((p, i) => <li key={i}>{p.name}</li>)}</ul>
        <p className="message-error">{message}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h2>🎱 Dashboard</h2>
      <h2 className="now-playing">
        {gameOver || currentPlayer === null
          ? "🏁 Game Over"
          : `Now Playing: ${players[currentPlayer].name}`}
      </h2>

      <p className="message-log">{message}</p>

      <div className="ball-section">
        <h3>👊 Ball Hit</h3>
        <div className="ball-grid">
          {balls.map((ball) => (
            <button
              key={ball.number}
              className={`ball ${ballHit === ball.number ? "selected" : ""}`}
              onClick={() => setBallHit(ball.number)}
              disabled={ball.potted}
              data-number={ball.number.toString()}
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
              className={`potted-ball ${ballsPotted.includes(ball.number) ? "selected" : ""} ${ball.potted ? "inactive" : ""}`}
              onClick={() => toggleBallPotted(ball.number)}
              disabled={ball.potted}
              data-number={ball.number.toString()}
            >
              {ball.number}
            </button>
          ))}
        </div>
        <div className="cue-button-wrapper">
          <button
            className={`cue-ball ${ballsPotted.includes(0) ? "selected" : ""}`}
            onClick={() => toggleBallPotted(0)}
          >
            ⚪
          </button>
        </div>
        <div className="ball-actions">
          <button onClick={handleConfirmTurn}>✅ Confirm Turn</button>
        </div>
      </div>

      <h3>📊 Scoreboard</h3>
      <ul className="scoreboard">
        {players.map((p, i) => (
          <li key={i} className={p.eliminated ? "eliminated" : ""}>
            {p.name}: {p.score} {p.eliminated && "❌ Eliminated"}
          </li>
        ))}
      </ul>

      <h3>📜 Turn History</h3>
      <ul className="history-log">
        {history.map((log, i) => (
          <li key={i}>
            <strong>{log.player}</strong> hit <strong>{log.hit}</strong>,
            potted: [{log.potted.join(", ") || "none"}] → <em>{log.message}</em> (Score: {log.score})
          </li>
        ))}
      </ul>

      {gameOver && (
        <div className="ball-actions stacked">
          <button onClick={handleDownloadLog}>📥 Download Game Log</button>
          <button onClick={handleResetGame}>🔁 Restart Game</button>
        </div>
      )}
    </div>
  );
}
