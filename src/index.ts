#!/usr/bin/env node
import { commands } from "./commands/index.js";
import { CreateGameCommand } from "./commands/manageGames.js";
import { getCurrentGame } from "./gameState.js";
import type { Command } from "./types.js";
import { chooseCommand, loadAppState, runCommand } from "./utils.js";

const rootCommand: Command<string> = {
  name: "root",
  run: async () => {
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    if (!game) {
      return CreateGameCommand.run();
    }

    const command = await chooseCommand({
      question: "What do you want to do?",
      commands: Object.values(commands),
    });

    return command.run();
  },
};

runCommand(rootCommand).then((msg: string) => {
  console.log(msg);
});
