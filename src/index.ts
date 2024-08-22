#!/usr/bin/env node
import { commands } from "./commands/index.js";
import { chooseCommand, runCommand } from "./utils.js";

const rootCommand = {
  name: "root",
  run: async () => {
    const command = await chooseCommand({
      question: "What do you want to do?",
      commands: Object.values(commands),
    });

    command.run();
  },
};

runCommand(rootCommand);
