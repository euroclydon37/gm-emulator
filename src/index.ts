#!/usr/bin/env node
import { Console, Effect, pipe } from "effect";
import { commands } from "./commands/index.js";
import { CreateGameCommand } from "./commands/manageGames.js";
import { getCurrentGame } from "./gameState.js";
import { chooseCommand, loadAppState, runCommand } from "./utils.js";
import { Command } from "./types.js";

const rootCommand: Command = {
  name: "root",
  run: Effect.promise(async () => {
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    if (!game) {
      return CreateGameCommand;
    }

    const command = await chooseCommand({
      question: "What do you want to do?",
      commands: Object.values(commands),
    });

    return command;
  }),
};

const program = runCommand(rootCommand);

Effect.runFork(program);
