export interface Command<T> {
  name: string;
  run: () => Promise<T>;
}

export interface Fact {
  name: string;
  value: string;
}

export interface GameState {
  id: string;
  name: string;
  dice: {
    roll_history: ReadonlyArray<string>;
    named_rolls: Record<string, string>;
  };
  log: ReadonlyArray<string>;
  facts: Record<string, Fact>;
}

export interface AppState {
  currentGame: string | undefined;
  games: ReadonlyArray<GameState>;
}
