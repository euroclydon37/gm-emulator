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
  setActiveGame,
  updateGameState,
} from "../gameState.js";

export const CreateGameCommand = {
  name: "Create",
  run: async () => {
    const appState = await loadAppState();
    const name = await askForString("Enter the name of your game.");
    const game = createGame(name);

    await saveAppState(setActiveGame(game.id, addGame(game, appState)));

    const result = `Created ${name}!`;

    console.log(wrapOutput(chalk.yellow(result)));
  },
};

const DeleteGameCommand = {
  name: "Delete",
  run: async () => {
    console.log(wrapOutput(chalk.yellow("Not implemented yet")));
  },
};

const SetActiveGameCommand = {
  name: "Set active",
  run: async () => {
    console.log(wrapOutput(chalk.yellow("Not implemented yet")));
  },
};

const ListGamesCommand = {
  name: "List",
  run: async () => {
    console.log(wrapOutput(chalk.yellow("Not implemented yet")));
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
