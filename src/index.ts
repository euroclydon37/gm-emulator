#!/usr/bin/env node
import { commands } from "./commands/index.js";
import { CreateGameCommand } from "./commands/manageGames.js";
import { getCurrentGame } from "./gameState.js";
import { chooseCommand, loadAppState, runCommand } from "./utils.js";

const rootCommand = {
  name: "root",
  run: async () => {
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    if (!game) {
      CreateGameCommand.run();
      return;
    }

    const command = await chooseCommand({
      question: "What do you want to do?",
      commands: Object.values(commands),
    });

    command.run();
  },
};

runCommand(rootCommand);
