import { last } from "./fp.js";
import { AppState, Fact, GameState } from "./types";

//#region Managing games
export const getCurrentGame = (state: AppState) =>
  state.games.find((game) => game.id === state.currentGame)!;

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

export function addGame(game: GameState, appState: AppState): AppState {
  return {
    ...appState,
    games: [...appState.games, game],
  };
}

export function setActiveGame(id: string, appState: AppState): AppState {
  return {
    ...appState,
    currentGame: id,
  };
}

export const updateGameState = (
  appState: AppState,
  gameState: GameState
): AppState => ({
  currentGame: appState.currentGame,
  games: appState.games.map((game) =>
    game.id === gameState.id ? gameState : game
  ),
});

//#endregion

//#region Managing dice
export function getRollHistory(game: GameState): ReadonlyArray<string> {
  return game.dice.roll_history;
}

export function saveLastDicePool(dicePool: string, game: GameState): GameState {
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
}

export function getNamedDicePools(game: GameState): Record<string, string> {
  return game.dice.named_rolls;
}

export function saveNamedDicePool(
  name: string,
  combo: string,
  game: GameState
) {
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
}

export function removeNamedDicePool(name: string, game: GameState) {
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
}
//#endregion

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
