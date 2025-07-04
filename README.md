# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



<p>Declared Ball: <strong>{declaredBall}</strong></p>
<p className="message-log">{message}</p>



//    const winner = alive.sort((a, b) => b.score - a.score)[0];
    //    setMessage(`🏆 Game Over! Winner: ${winner.name} (${winner.score} pts)`);
    //    setGameOver(true);
    //  }

    //if (alive.length === 1) {
    //  const winner = alive[0];
    //  setMessage(`🏆 Game Over! Winner: ${winner.name} (${winner.score} pts)`);
    //}
    //};

  //const checkWinner = (updatedBalls, updatedPlayers = players) => {
  //  const remaining = updatedBalls.filter((b) => !b.potted);
  //  const alive = updatedPlayers.filter((p) => !p.eliminated);

  //  if (remaining.length === 0 || alive.length === 1) {
  //    const winner = alive.sort((a, b) => b.score - a.score)[0];
  //    setMessage(`🏆 Game Over! Winner: ${winner.name} (${winner.score} pts)`);
  //    setGameOver(true);
  //  }
  //};

   const nextTurn = () => {
    if (gameOver) return; // 🛑 Prevent further turns

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

  const handleMissedShot = () => {
    const updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayer];
    const missValue = getBallValue(declaredBall);
    player.score -= missValue;

    const logMessage = `❌ Missed Shot! -${missValue} points`;

    setPlayers(updatedPlayers);
    setMessage(logMessage);
    setHistory((prev) => [
      {
        player: player.name,
        hit: ballHit,
        potted: [...ballsPotted],
        message: logMessage,
        score: player.score,
      },
      ...prev,
    ]);

    checkElimination(updatedPlayers, balls);
    //checkWinner(balls);
    nextTurn(balls);
  };