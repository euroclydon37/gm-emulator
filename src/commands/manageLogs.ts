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
  dropLastLogEntry,
  updateGameState,
} from "../gameState.js";
import chalk from "chalk";
import { last } from "../fp.js";
import { Command } from "../types.js";
import { Effect, pipe } from "effect";

const ListLogsCommand: Command = {
  __tag: "command",
  name: "List logs",
  run: pipe(
    Effect.zip(
      askForNumber("How many logs do you want to see?"),
      pipe(loadAppState, Effect.map(getCurrentGame)),
    ),
    Effect.map(([count, game]) => {
      return game.log.length === 0
        ? "No logs available"
        : game.log
            .map((t) => `- ${t}`)
            .slice(-count)
            .join("\n");
    }),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

const AddLogCommand: Command = {
  __tag: "command",
  name: "Add log",
  run: pipe(
    askForString("Type your log"),
    Effect.map(addLogEntry),
    Effect.map(updateGameState),
    Effect.flatMap(saveAppState),
    Effect.map(() => "Added log"),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

const DeleteLogCommand: Command = {
  __tag: "command",
  name: "Delete log",
  run: pipe(
    loadAppState,
    Effect.map(getCurrentGame),
    Effect.flatMap((game) => {
      if (game.log.length === 0) {
        return Effect.fail(new Error("No logs to delete"));
      }
      return Effect.succeed(last(game.log));
    }),
    Effect.map(() => dropLastLogEntry),
    Effect.map(updateGameState),
    Effect.flatMap(saveAppState),
    Effect.map(() => "Deleted last log"),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

export const ManageLogsCommand: Command = {
  __tag: "command",
  name: "Logs",
  run: chooseCommand({
    question: "What do you want to do?",
    commands: [AddLogCommand, DeleteLogCommand, ListLogsCommand],
  }),
};
