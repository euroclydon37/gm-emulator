import chalk from "chalk";
import {
  askForString,
  chooseCommand,
  loadAppState,
  saveAppState,
  wrapOutput,
} from "../utils.js";
import {
  addGame,
  createGame,
  deleteGame,
  getCurrentGame,
  getGameById,
  setActiveGame,
} from "../gameState.js";
import prompts from "prompts";
import { Command } from "../types.js";
import { Effect, pipe } from "effect";
import { pipe as pipeFn } from "../fp";

const emphasize = (text: string) => chalk.green(`${text} (active)`);

const chooseGame = pipe(
  loadAppState,
  Effect.map((state) => ({
    appState: state,
    currentGame: getCurrentGame(state),
  })),
  Effect.flatMap(({ appState, currentGame }) =>
    Effect.tryPromise({
      try: async () => {
        const { game_id } = await prompts({
          type: "autocomplete",
          message: "Which game?",
          name: "game_id",
          choices: appState.games.map((game) => ({
            title:
              game.id === currentGame.id ? emphasize(game.name) : game.name,
            value: game.id,
          })),
        });

        if (game_id === currentGame.id) throw new Error();

        return getGameById(game_id, appState);
      },
      catch: () => new Error("Cannot modify active game."),
    }),
  ),
);

export const CreateGameCommand: Command = {
  __tag: "command",
  name: "Create",
  run: pipe(
    askForString("Enter the name of your game."),
    Effect.map(createGame),
    Effect.map((game) => pipeFn(addGame(game), setActiveGame(game.id))),
    Effect.flatMap(saveAppState),
    Effect.map(() => "Created game"),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

const DeleteGameCommand: Command = {
  __tag: "command",
  name: "Delete",
  run: pipe(
    loadAppState,
    Effect.map((state) => ({
      appState: state,
      currentGame: getCurrentGame(state),
    })),
    Effect.flatMap(({ appState, currentGame }) =>
      Effect.promise(async () => {
        const { game_id } = await prompts({
          type: "autocomplete",
          message: "Which game do you want to delete?",
          name: "game_id",
          choices: appState.games.map((game) => ({
            title:
              game.id === currentGame.id ? emphasize(game.name) : game.name,
            value: game.id,
          })),
        });

        if (typeof game_id !== "string") throw new Error();

        return {
          appState,
          currentGame,
          id: game_id,
        };
      }),
    ),
    Effect.flatMap(({ id, appState, currentGame }) => {
      const game = getGameById(id, appState);

      if (game.id === currentGame.id) {
        return Effect.fail(new Error("Game is active. Change games first."));
      }
      return Effect.succeed(id);
    }),
    Effect.map(deleteGame),
    Effect.flatMap(saveAppState),
    Effect.map(() => "Deleted game"),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

const SetActiveGameCommand: Command = {
  __tag: "command",
  name: "Set active",
  run: pipe(
    loadAppState,
    Effect.map((state) => ({
      appState: state,
      currentGame: getCurrentGame(state),
    })),
    Effect.flatMap(({ appState, currentGame }) =>
      Effect.tryPromise({
        try: async () => {
          const { game_id } = await prompts({
            type: "autocomplete",
            message: "Which game do you want to set as active?",
            name: "game_id",
            choices: appState.games.map((game) => ({
              title:
                game.id === currentGame.id ? emphasize(game.name) : game.name,
              value: game.id,
            })),
          });

          if (game_id === currentGame.id) throw new Error();

          return game_id as string;
        },
        catch: () => new Error("Game is active. Change games first."),
      }),
    ),
    Effect.map(setActiveGame),
    Effect.flatMap(saveAppState),
    Effect.map(() => "Changed active game."),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

const ListGamesCommand: Command = {
  __tag: "command",
  name: "List",
  run: pipe(
    loadAppState,
    Effect.map((state) => ({
      appState: state,
      currentGame: getCurrentGame(state),
    })),
    Effect.map(({ appState, currentGame }) => {
      return appState.games
        .map((game) =>
          game.id === currentGame.id ? emphasize(game.name) : game.name,
        )
        .join("\n");
    }),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

export const ManageGamesCommand: Command = {
  __tag: "command",
  name: "Games",
  run: chooseCommand({
    question: "What do you want to do?",
    commands: [
      CreateGameCommand,
      DeleteGameCommand,
      SetActiveGameCommand,
      ListGamesCommand,
    ],
  }),
};
