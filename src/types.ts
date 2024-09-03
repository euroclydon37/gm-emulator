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
    last_roll_combo: string | undefined;
    named_rolls: Record<string, string>;
  };
  log: ReadonlyArray<string>;
  facts: Record<string, Fact>;
}

export interface AppState {
  currentGame: string;
  games: ReadonlyArray<GameState>;
}
