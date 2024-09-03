export interface Command {
  name: string;
  run: () => void;
}

export interface Fact {
  name: string;
  value: string;
}

export interface GameState {
  id: string;
  dice: {
    roll_history: ReadonlyArray<string>;
    named_rolls: Record<string, string>;
  };
  log: ReadonlyArray<string>;
  facts: Record<string, Fact>;
}

export interface AppState {
  currentGame: string;
  games: ReadonlyArray<GameState>;
}
