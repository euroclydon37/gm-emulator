import chalk from "chalk";
import { actionTheme } from "../tables/action-theme.js";
import { pickRandom, wrapOutput } from "../utils.js";

export const ActionThemeCommand = {
  name: "Roll an action/theme",
  run: () => {
    const [action, theme] = [
      pickRandom(actionTheme).action,
      pickRandom(actionTheme).theme,
    ];

    console.log(wrapOutput(chalk.yellow(`${action} ${theme}`)));
  },
};
