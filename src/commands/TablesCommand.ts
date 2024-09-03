import chalk from "chalk";
import { actionTheme } from "../tables/action-theme.js";
import { descriptorFocus } from "../tables/descriptor-focus.js";
import { chooseCommand, pickRandom, wrapOutput } from "../utils.js";

const ActionThemeCommand = {
  name: "Action/theme",
  run: () => {
    const [action, theme] = [
      pickRandom(actionTheme).action,
      pickRandom(actionTheme).theme,
    ];

    console.log(wrapOutput(chalk.yellow(`${action} ${theme}`)));
  },
};

const DescriptorFocusCommand = {
  name: "Descriptor/focus",
  run: () => {
    const [descriptor, focus] = [
      pickRandom(descriptorFocus).descriptor,
      pickRandom(descriptorFocus).focus,
    ];

    console.log(wrapOutput(chalk.yellow(`${descriptor} ${focus}`)));
  },
};

export const TablesCommand = {
  name: "Tables",
  run: async () => {
    const command = await chooseCommand({
      question: "Which table do you want to roll?",
      commands: [ActionThemeCommand, DescriptorFocusCommand],
    });

    command.run();
  },
};
