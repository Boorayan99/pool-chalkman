// App.jsx — Updated Logic with Foul Deductions, Missed Shot Fix, and Accurate Logging
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
    BALL_NUMBERS.map((num) => ({
      number: num,
      value: getBallValue(num),
      potted: false,
    }))
  );
  const [message, setMessage] = useState("");
  const [declaredBall, setDeclaredBall] = useState(null);
  const [ballHit, setBallHit] = useState(null);
  const [ballsPotted, setBallsPotted] = useState([]);
  const [history, setHistory] = useState([]);
  const [isFirstBallYetPotted, setIsFirstBallYetPotted] = useState(false);
  const [gameOver, setGameOver] = useState(false); // 🧠 Track Game Over

  const handleResetGame = () => {
    setSetupPhase(true);
    setPlayerName("");
    setPlayers([]);
    setCurrentPlayer(0);
    setBalls(
      BALL_NUMBERS.map((num) => ({
        number: num,
        value: getBallValue(num),
        potted: false,
      }))
    );
    setMessage("");
    setDeclaredBall(null);
    setBallHit(null);
    setBallsPotted([]);
    setHistory([]);
    setIsFirstBallYetPotted(false);
    setGameOver(false);
  };

  const handleDownloadLog = () => {
    const logText = history
      .map((log, index) => {
        return `Turn ${history.length - index}:\nPlayer: ${log.player}\nHit: ${
          log.hit
        }\nPotted: ${log.potted.join(", ") || "none"}\nMessage: ${
          log.message
        }\nScore: ${log.score}\n\n`;
      })
      .join("");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pool_game_log.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLowestRemainingBall = () => {
    const remainingBalls = balls.filter((b) => !b.potted);
    const minValue = Math.min(...remainingBalls.map((b) => b.value));
    const lowestBall = remainingBalls.find((b) => b.value === minValue);
    return lowestBall?.number;
  };

  const addPlayer = () => {
    if (playerName.trim() && players.length < 10) {
      setPlayers([
        ...players,
        { name: playerName.trim(), score: 0, eliminated: false },
      ]);
      setPlayerName("");
    }
  };

  const startGame = () => {
    if (players.length >= 2) {
      setDeclaredBall(getLowestRemainingBall());
      setSetupPhase(false);
    } else {
      setMessage("At least 2 players required.");
    }
  };

  const toggleBallPotted = (number) => {
    if (number !== 0 && balls.find((b) => b.number === number)?.potted) return;
    if (ballsPotted.includes(number)) {
      setBallsPotted(ballsPotted.filter((n) => n !== number));
    } else {
      setBallsPotted([...ballsPotted, number]);
    }
  };

  const handleMissedShot = () => {
    const declared = getLowestRemainingBall();
    const fakeBallHit = 0;

    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];
    const ballsCopy = [...balls];

    const declaredValue = getBallValue(declared);
    const penalty = declaredValue; // ✅ FIXED: No +1

    let msg = `❌ Missed Shot! -${penalty} points for failing to hit Ball ${declared}`;

    player.score -= penalty;

    if (player && player.name) {
      setHistory((prev) => [
        {
          player: player.name,
          hit: fakeBallHit,
          potted: [],
          message: msg,
          score: player.score,
        },
        ...prev,
      ]);
    }

    setPlayers(updatedPlayers);
    setMessage(msg);
    checkElimination(updatedPlayers, ballsCopy);
    nextTurn();
  };



  const handleConfirmTurn = () => {
    if (ballHit === null) {
      setMessage("Select the ball that was hit first.");
      return;
    }

    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];
    const ballsCopy = [...balls];
    const declared = ballHit;
    setDeclaredBall(ballHit);

    const cueBallPotted = ballsPotted.includes(0);
    const declaredBallPotted = ballsPotted.includes(declared);
    const cueBallOnly = ballsPotted.length === 1 && cueBallPotted;
    const declaredBallStillOnTable = balls.some(
      (b) => b.number === declared && !b.potted
    );

    let score = 0;
    let msg = "";

    for (let num of ballsPotted) {
      if (num !== 0 && num !== declared) {
        score += getBallValue(num);
      }
    }

    if (!isFirstBallYetPotted) {
      if (!cueBallPotted && declaredBallPotted) {
        score += getBallValue(declared);
      }
      if (ballsPotted.some((n) => n !== 0)) {
        setIsFirstBallYetPotted(true);
      }
    } else {
      const declaredValue = getBallValue(declared);

      const scoringBalls = ballsPotted.filter(
        (val) => val !== 0 && val !== declared
      );

      score = scoringBalls.reduce((sum, num) => sum + getBallValue(num), 0);

      if (cueBallOnly && declaredBallStillOnTable) {
        score -= declaredValue;
        msg = `🚨 Foul! Only cue ball potted. -${declaredValue} points.`;
      } else if (cueBallPotted && declaredBallPotted) {
        // ✅ Legal pot AND foul → award all valid pots, subtract declared
        score += declaredValue; // reward for potting declared
        score -= declaredValue; // but foul cost cancels it out
        msg = `⚠️ Cue and declared ball both potted. +${declaredValue} -${declaredValue} = 0. Total: ${
          score > 0 ? "+" : ""
        }${score}`;
      } else if (cueBallPotted) {
        score -= declaredValue;
        msg = `⚠️ Cue ball potted. +${scoringBalls.reduce(
          (sum, num) => sum + getBallValue(num),
          0
        )} -${declaredValue} = ${score > 0 ? "+" : ""}${score}`;
      } else {
        if (declaredBallPotted) {
          score += declaredValue;
        }
        msg = `✅ Turn Complete. Score: ${score}`;
      }
    }

    player.score += score;

    ballsCopy.forEach((b, i) => {
      if (ballsPotted.includes(b.number)) {
        ballsCopy[i] = { ...b, potted: true };
      }
    });

    setBalls(ballsCopy);
    setPlayers(updatedPlayers);
    setMessage(msg);
    setBallHit(null);
    setBallsPotted([]);

    if (updatedPlayers[currentPlayer]) {
      console.log("Logging turn for:", updatedPlayers[currentPlayer])
      setHistory((prev) => [
      {
        player: updatedPlayers[currentPlayer].name,
        hit: ballHit,
        potted: [...ballsPotted],
        message: msg,
        score: updatedPlayers[currentPlayer].score,
      },
      ...prev,
    ]);
    }
    
    //checkElimination(updatedPlayers, ballsCopy);
    //checkWinner(ballsCopy);
    //nextTurn(updatedPlayers);
    const finalPlayers = checkElimination(updatedPlayers, ballsCopy);
    nextTurn(finalPlayers);

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

    // 🏆 Immediate win check
    const alive = reviewed.filter((p) => !p.eliminated);
    if (alive.length === 1) {
      const winner = alive[0];
      setMessage(`🏆 Game Over! Winner: ${winner.name} (${winner.score} pts)`);
      setGameOver(true);
    }

    return reviewed; // ✅ <-- return the up-to-date player list
  };

  //const checkWinner = (updatedBalls, updatedPlayers = players) => {
  //  const remaining = updatedBalls.filter((b) => !b.potted);
  //  const alive = updatedPlayers.filter((p) => !p.eliminated);

  //  if (remaining.length === 0 || alive.length === 1) {
  //    const winner = alive.sort((a, b) => b.score - a.score)[0];
  //    setMessage(`🏆 Game Over! Winner: ${winner.name} (${winner.score} pts)`);
  //    setGameOver(true);
  //  }
  //};

  const nextTurn = (playerList = players) => {
    let nextIndex = currentPlayer;

    for (let i = 0; i < players.length; i++) {
      nextIndex = (nextIndex + 1) % playerList.length;
      if (!playerList[nextIndex].eliminated) {
        setCurrentPlayer(nextIndex);
        return;
      }
    }
    // All eliminated
    setCurrentPlayer(null);
    // If we looped through all and found no eligible players
    setMessage("🎉 Game Over!");
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
      <h2>🎱 Dashboard</h2>
      {gameOver ? (
        <h2 className="now-playing">🏁 Game Over</h2>
      ) : (
        <h2 className="now-playing">
          Now Playing: {players[currentPlayer].name}
        </h2>
      )}

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
              className={`potted-ball ${
                ballsPotted.includes(ball.number) ? "selected" : ""
              } ${ball.potted ? "inactive" : ""}`}
              data-number={ball.number}
              onClick={() => toggleBallPotted(ball.number)}
              disabled={ball.potted}
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
        {history.map((log, index) => (
          <li key={index}>
            <strong>{log.player}</strong> hit <strong>{log.hit}</strong>,
            potted: [{log.potted.join(", ") || "none"}] →<em>{log.message}</em>{" "}
            (Score: {log.score})
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
