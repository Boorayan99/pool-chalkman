# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



<p>Declared Ball: <strong>{declaredBall}</strong></p>
<p className="message-log">{message}</p>

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

  