import chalk from "chalk";
import { actionTheme } from "../tables/action-theme.js";
import { descriptorFocus } from "../tables/descriptor-focus.js";
import { chooseCommand, pickRandom, wrapOutput } from "../utils.js";
import type { Command } from "../types.js";
import { Effect, pipe } from "effect";

const ActionThemeCommand: Command = {
  __tag: "command",
  name: "Action/theme",
  run: pipe(
    Effect.zip(pickRandom(actionTheme), pickRandom(actionTheme)),
    Effect.map(([a, t]) => `${a.action} ${t.theme}`),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

const DescriptorFocusCommand: Command = {
  __tag: "command",
  name: "Descriptor/focus",
  run: pipe(
    Effect.zip(pickRandom(descriptorFocus), pickRandom(descriptorFocus)),
    Effect.map(([d, f]) => `${d.descriptor} ${f.focus}`),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

export const TablesCommand: Command = {
  __tag: "command",
  name: "Tables",
  run: chooseCommand({
    question: "Which table do you want to roll?",
    commands: [ActionThemeCommand, DescriptorFocusCommand],
  }),
};
