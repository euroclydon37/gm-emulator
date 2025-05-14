#!/usr/bin/env node
import { Console, Effect, pipe } from "effect";
import { commands } from "./commands/index.js";
import { CreateGameCommand } from "./commands/manageGames.js";
import { getCurrentGame } from "./gameState.js";
import { chooseCommand, loadAppState, runCommand } from "./utils.js";
import chalk from "chalk";

const program = pipe(
  Effect.promise(async () => {
    const appState = await loadAppState();
    const game = getCurrentGame(appState);
    return game;
  }),
  Effect.flatMap((game) => {
    if (!game) {
      return Effect.succeed(CreateGameCommand);
    }

    return chooseCommand({
      question: "What do you want to do?",
      commands: Object.values(commands),
    });
  }),
  Effect.flatMap(runCommand),
  Effect.match({
    onSuccess: (x) => x,
    onFailure: (error) => chalk.red(error.message),
  }),
  Effect.flatMap(Console.log),
);

Effect.runFork(program);
