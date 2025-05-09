import { Effect } from "effect";

export interface Command {
  name: string;
  run: Effect.Effect<Command | string, Error, never>;
}

export interface AppError {
  type: "error";
  message: string;
}

export interface Fact {
  name: string;
  value: string;
  details: Factbook;
}

export type Factbook = Record<string, Fact>;

export interface GameState {
  id: string;
  name: string;
  dice: {
    roll_history: ReadonlyArray<string>;
    named_rolls: Record<string, string>;
  };
  log: ReadonlyArray<string>;
  facts: Factbook;
}

export interface AppState {
  currentGame: string | undefined;
  games: ReadonlyArray<GameState>;
}
