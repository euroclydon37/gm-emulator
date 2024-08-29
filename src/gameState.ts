import { last } from "./fp.js";
import { AppState, Fact, GameState } from "./types";

export const updateGameState = (
  appState: AppState,
  gameState: GameState
): AppState => ({
  currentGame: appState.currentGame,
  games: appState.games.map((game) =>
    game.id === gameState.id ? gameState : game
  ),
});

export const getCurrentGame = (state: AppState) =>
  state.games.find((game) => game.id === state.currentGame)!;

// #region Managing logs
export function addLogEntry(log: string, game: GameState): GameState {
  return {
    ...game,
    log: [...game.log, log],
  };
}

export function removeLogEntry(game: GameState): GameState {
  return {
    ...game,
    log: game.log.slice(0, -1),
  };
}
// #endregion

// #region Managing facts

export function addFact(fact: Fact, game: GameState): GameState {
  return {
    ...game,
    facts: {
      ...game.facts,
      [fact.name]: fact,
    },
  };
}

export function removeFact(name: string, game: GameState): GameState {
  return {
    ...game,
    facts: Object.fromEntries(
      Object.entries(game.facts).filter(([factName]) => factName !== name)
    ),
  };
}

// #endregion
