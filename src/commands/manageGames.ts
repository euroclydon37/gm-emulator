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
import { pipe } from "../fp.js";
import prompts from "prompts";
import { Command } from "../types.js";

export const CreateGameCommand: Command = {
  name: "Create",
  run: async () => {
    const name = await askForString("Enter the name of your game.");
    const game = createGame(name);

    await saveAppState(pipe(addGame(game), setActiveGame(game.id)));

    return wrapOutput(chalk.yellow(`Created ${name}!`));
  },
};

const DeleteGameCommand: Command = {
  name: "Delete",
  run: async () => {
    const appState = await loadAppState();
    const currentGame = getCurrentGame(appState);

    const emphasize = (text: string) => chalk.green(`${text} (active)`);

    const { game_id } = await prompts({
      type: "autocomplete",
      message: "Which game do you want to delete?",
      name: "game_id",
      choices: appState.games.map((game) => ({
        title: game.id === currentGame.id ? emphasize(game.name) : game.name,
        value: game.id,
      })),
    });

    const game = getGameById(game_id, appState);

    if (game.id === currentGame.id) {
      return wrapOutput(chalk.yellow("Game is active. Change games first."));
    }

    await saveAppState(deleteGame(game_id));

    return wrapOutput(chalk.yellow(`Deleted ${game.name}`));
  },
};

const SetActiveGameCommand: Command = {
  name: "Set active",
  run: async () => {
    const appState = await loadAppState();
    const currentGame = getCurrentGame(appState);

    const emphasize = (text: string) => chalk.green(`${text} (active)`);

    const { game_id } = await prompts({
      type: "autocomplete",
      message: "Which game do you want to set as active?",
      name: "game_id",
      choices: appState.games.map((game) => ({
        title: game.id === currentGame.id ? emphasize(game.name) : game.name,
        value: game.id,
      })),
    });

    await saveAppState(setActiveGame(game_id));

    return wrapOutput(
      chalk.yellow(`Set active game to ${getGameById(game_id, appState).name}`),
    );
  },
};

const ListGamesCommand: Command = {
  name: "List",
  run: async () => {
    const appState = await loadAppState();
    const currentGame = getCurrentGame(appState);

    const emphasize = (text: string) => chalk.green(`${text} (active)`);

    const result = appState.games
      .map((game) =>
        game.id === currentGame.id ? emphasize(game.name) : game.name,
      )
      .join("\n");

    return wrapOutput(chalk.yellow(result));
  },
};

export const ManageGamesCommand: Command = {
  name: "Games",
  run: async () => {
    const command = await chooseCommand({
      question: "What do you want to do?",
      commands: [
        CreateGameCommand,
        DeleteGameCommand,
        SetActiveGameCommand,
        ListGamesCommand,
      ],
    });

    return command.run();
  },
};
