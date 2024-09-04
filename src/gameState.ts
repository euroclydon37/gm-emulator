import { last } from "./fp.js";
import { AppState, Fact, GameState } from "./types";

//#region Managing games
export const getGameById = (id: string | undefined, state: AppState) =>
  state.games.find((game) => game.id === id)!;

export const getCurrentGame = (state: AppState) =>
  getGameById(state.currentGame, state);

export function createGame(name: string): GameState {
  return {
    id: String(new Date().toISOString()),
    name,
    dice: {
      roll_history: [],
      named_rolls: {},
    },
    log: [],
    facts: {},
  };
}

export const addGame =
  (game: GameState) =>
  (appState: AppState): AppState => {
    return {
      ...appState,
      games: [...appState.games, game],
    };
  };

export const setActiveGame =
  (id: string) =>
  (appState: AppState): AppState => {
    return {
      ...appState,
      currentGame: id,
    };
  };

export const updateGameState =
  (updater: (gameState: GameState) => GameState) =>
  (appState: AppState): AppState => {
    const gameState = getCurrentGame(appState);
    return {
      currentGame: appState.currentGame,
      games: appState.games.map((game) =>
        game.id === gameState.id ? updater(game) : game
      ),
    };
  };

export const deleteGame =
  (id: string) =>
  (appState: AppState): AppState => {
    return {
      ...appState,
      games: appState.games.filter((game) => game.id !== id),
    };
  };

//#endregion

//#region Managing dice
export function getRollHistory(game: GameState): ReadonlyArray<string> {
  return game.dice.roll_history;
}

export const saveLastDicePool =
  (dicePool: string) =>
  (game: GameState): GameState => {
    const removeWhiteSpace = (text: string) => text.replace(/\s/g, "");
    return {
      ...game,
      dice: {
        ...game.dice,
        roll_history: [removeWhiteSpace(dicePool), ...game.dice.roll_history]
          .filter((item) => item !== undefined && item !== null)
          .slice(0, 3),
      },
    };
  };

export function getNamedDicePools(game: GameState): Record<string, string> {
  return game.dice.named_rolls;
}

export const saveNamedDicePool =
  (name: string, combo: string) =>
  (game: GameState): GameState => {
    return {
      ...game,
      dice: {
        ...game.dice,
        named_rolls: {
          ...game.dice.named_rolls,
          [name]: combo,
        },
      },
    };
  };

export const removeNamedDicePool =
  (name: string) =>
  (game: GameState): GameState => {
    return {
      ...game,
      dice: {
        ...game.dice,
        named_rolls: Object.fromEntries(
          Object.entries(game.dice.named_rolls).filter(
            ([factName]) => factName !== name
          )
        ),
      },
    };
  };
//#endregion

// #region Managing logs
export const addLogEntry =
  (log: string) =>
  (game: GameState): GameState => {
    return {
      ...game,
      log: [...game.log, log],
    };
  };

export function removeLogEntry(game: GameState): GameState {
  return {
    ...game,
    log: game.log.slice(0, -1),
  };
}
// #endregion

// #region Managing facts

export const addFact =
  (fact: Fact) =>
  (game: GameState): GameState => {
    return {
      ...game,
      facts: {
        ...game.facts,
        [fact.name]: fact,
      },
    };
  };

export const removeFact =
  (name: string) =>
  (game: GameState): GameState => {
    return {
      ...game,
      facts: Object.fromEntries(
        Object.entries(game.facts).filter(([factName]) => factName !== name)
      ),
    };
  };

// #endregion
