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
import { Command } from "../types.js";
import { Effect } from "effect";

const ListLogsCommand: Command = {
  __tag: "command",
  name: "List logs",
  run: Effect.promise(async () => {
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

    return wrapOutput(chalk.yellow(message));
  }),
};

const AddLogCommand: Command = {
  __tag: "command",
  name: "Add log",
  run: Effect.promise(async () => {
    const log = await askForString("Type your log");

    await saveAppState(updateGameState(addLogEntry(log)));

    return wrapOutput(chalk.yellow(`Added log: ${log}`));
  }),
};

const DeleteLogCommand: Command = {
  __tag: "command",
  name: "Delete log",
  run: Effect.promise(async () => {
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    if (game.log.length === 0) {
      return wrapOutput(chalk.yellow("No logs to delete"));
    }

    const lastLog = last(game.log);

    await saveAppState(updateGameState(removeLogEntry));
    return wrapOutput(chalk.yellow(`Deleted log: ${lastLog}`));
  }),
};

export const ManageLogsCommand: Command = {
  __tag: "command",
  name: "Logs",
  run: chooseCommand({
    question: "What do you want to do?",
    commands: [AddLogCommand, DeleteLogCommand, ListLogsCommand],
  }),
};
