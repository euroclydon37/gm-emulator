import {
  askForNumber,
  askForString,
  chooseCommand,
  loadAppState,
  saveAppState,
  wrapOutput,
} from "../utils.js";
import { addLogEntry, getCurrentGame, updateGameState } from "../gameState.js";
import chalk from "chalk";

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
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    await saveAppState(updateGameState(appState, addLogEntry(log, game)));

    console.log(wrapOutput(chalk.yellow(`Added log: ${log}`)));
  },
};

export const ManageLogsCommand = {
  name: "Manage logs",
  run: async () => {
    const command = await chooseCommand({
      question: "What do you want to do?",
      commands: [AddLogCommand, ListLogsCommand],
    });

    command.run();
  },
};
