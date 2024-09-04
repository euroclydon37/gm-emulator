import {
  askForNumber,
  askForString,
  chooseCommand,
  loadAppState,
  saveAppState,
  wrapOutput,
} from "../utils.js";
import {
  addLogEntry,
  getCurrentGame,
  removeLogEntry,
  updateGameState,
} from "../gameState.js";
import chalk from "chalk";
import { last } from "../fp.js";

const ListLogsCommand = {
  name: "List logs",
  run: async () => {
    const logCount = await askForNumber("How many logs do you want to see?");
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    const message =
      game.log.length === 0
        ? "No logs available"
        : game.log
            .map((t) => `- ${t}`)
            .slice(-logCount)
            .join("\n");

    console.log(wrapOutput(chalk.yellow(message)));
  },
};

const AddLogCommand = {
  name: "Add log",
  run: async () => {
    const log = await askForString("Type your log");

    await saveAppState(updateGameState(addLogEntry(log)));

    console.log(wrapOutput(chalk.yellow(`Added log: ${log}`)));
  },
};

const DeleteLogCommand = {
  name: "Delete log",
  run: async () => {
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    if (game.log.length === 0) {
      console.log(wrapOutput(chalk.yellow("No logs to delete")));
      return;
    }

    const lastLog = last(game.log);

    await saveAppState(updateGameState(removeLogEntry));
    console.log(wrapOutput(chalk.yellow(`Deleted log: ${lastLog}`)));
  },
};

export const ManageLogsCommand = {
  name: "Logs",
  run: async () => {
    const command = await chooseCommand({
      question: "What do you want to do?",
      commands: [AddLogCommand, DeleteLogCommand, ListLogsCommand],
    });

    command.run();
  },
};
