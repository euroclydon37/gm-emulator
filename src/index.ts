#!/usr/bin/env node
import { Console, Effect, pipe } from "effect";
import { commands } from "./commands/index.js";
import { CreateGameCommand } from "./commands/manageGames.js";
import { getCurrentGame } from "./gameState.js";
import { chooseCommand, loadAppState, runCommand } from "./utils.js";
import chalk from "chalk";

const program = pipe(
  loadAppState,
  Effect.map(getCurrentGame),
  Effect.flatMap((game) => {
    return !game
      ? Effect.succeed(CreateGameCommand)
      : chooseCommand({
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
