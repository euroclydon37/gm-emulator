export interface Command {
  name: string;
  run: () => void;
}

export interface GameState {
  id: string;
  log: ReadonlyArray<string>;
  facts: Record<string, string>;
}

export interface AppState {
  currentGame: string;
  games: ReadonlyArray<GameState>;
}
