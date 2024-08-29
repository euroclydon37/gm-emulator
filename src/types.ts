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
  log: ReadonlyArray<string>;
  facts: Record<string, Fact>;
}

export interface AppState {
  currentGame: string;
  games: ReadonlyArray<GameState>;
}
