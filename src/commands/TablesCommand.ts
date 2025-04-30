import chalk from "chalk";
import { actionTheme } from "../tables/action-theme.js";
import { descriptorFocus } from "../tables/descriptor-focus.js";
import { chooseCommand, pickRandom, wrapOutput } from "../utils.js";
import type { Command } from "../types.js";

const ActionThemeCommand: Command<string> = {
  name: "Action/theme",
  run: async () => {
    const [action, theme] = [
      pickRandom(actionTheme).action,
      pickRandom(actionTheme).theme,
    ];

    return wrapOutput(chalk.yellow(`${action} ${theme}`));
  },
};

const DescriptorFocusCommand: Command<string> = {
  name: "Descriptor/focus",
  run: async () => {
    const [descriptor, focus] = [
      pickRandom(descriptorFocus).descriptor,
      pickRandom(descriptorFocus).focus,
    ];

    return wrapOutput(chalk.yellow(`${descriptor} ${focus}`));
  },
};

export const TablesCommand: Command<string> = {
  name: "Tables",
  run: async () => {
    const command = await chooseCommand({
      question: "Which table do you want to roll?",
      commands: [ActionThemeCommand, DescriptorFocusCommand],
    });

    return command.run();
  },
};
