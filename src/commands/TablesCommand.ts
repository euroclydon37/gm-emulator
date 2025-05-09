import chalk from "chalk";
import { actionTheme } from "../tables/action-theme.js";
import { descriptorFocus } from "../tables/descriptor-focus.js";
import { chooseCommand, pickRandom, wrapOutput } from "../utils.js";
import type { Command } from "../types.js";
import { Effect } from "effect";

const ActionThemeCommand: Command = {
  name: "Action/theme",
  run: Effect.promise(async () => {
    const [action, theme] = [
      pickRandom(actionTheme).action,
      pickRandom(actionTheme).theme,
    ];

    return wrapOutput(chalk.yellow(`${action} ${theme}`));
  }),
};

const DescriptorFocusCommand: Command = {
  name: "Descriptor/focus",
  run: Effect.promise(async () => {
    const [descriptor, focus] = [
      pickRandom(descriptorFocus).descriptor,
      pickRandom(descriptorFocus).focus,
    ];

    return wrapOutput(chalk.yellow(`${descriptor} ${focus}`));
  }),
};

export const TablesCommand: Command = {
  name: "Tables",
  run: Effect.promise(async () => {
    const command = await chooseCommand({
      question: "Which table do you want to roll?",
      commands: [ActionThemeCommand, DescriptorFocusCommand],
    });

    return command;
  }),
};
