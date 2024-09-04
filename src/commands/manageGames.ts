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

export const CreateGameCommand = {
  name: "Create",
  run: async () => {
    const name = await askForString("Enter the name of your game.");
    const game = createGame(name);

    await saveAppState(pipe(addGame(game), setActiveGame(game.id)));

    const result = `Created ${name}!`;

    console.log(wrapOutput(chalk.yellow(result)));
  },
};

const DeleteGameCommand = {
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
      console.log(
        wrapOutput(chalk.yellow("Game is active. Change games first."))
      );
      return;
    }

    await saveAppState(deleteGame(game_id));

    console.log(wrapOutput(chalk.yellow(`Deleted ${game.name}`)));
  },
};

const SetActiveGameCommand = {
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

    console.log(
      wrapOutput(
        chalk.yellow(
          `Set active game to ${getGameById(game_id, appState).name}`
        )
      )
    );
  },
};

const ListGamesCommand = {
  name: "List",
  run: async () => {
    const appState = await loadAppState();
    const currentGame = getCurrentGame(appState);

    const emphasize = (text: string) => chalk.green(`${text} (active)`);

    const result = appState.games
      .map((game) =>
        game.id === currentGame.id ? emphasize(game.name) : game.name
      )
      .join("\n");

    console.log(wrapOutput(chalk.yellow(result)));
  },
};

export const ManageGamesCommand = {
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

    command.run();
  },
};
