import { last } from "./fp.js";
import { AppState, GameState } from "./types";

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

export function addLogEntry(log: string, game: GameState): GameState {
  return {
    ...game,
    log: [...game.log, log],
  };
}
