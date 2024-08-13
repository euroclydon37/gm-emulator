import chalk from "chalk";
import { descriptorFocus } from "../tables/descriptor-focus.js";
import { pickRandom, wrapOutput } from "../utils.js";

export const DescriptorFocusCommand = {
  name: "Roll a descriptor/focus",
  run: () => {
    const [descriptor, focus] = [
      pickRandom(descriptorFocus).descriptor,
      pickRandom(descriptorFocus).focus,
    ];

    console.log(wrapOutput(chalk.yellow(`${descriptor} ${focus}`)));
  },
};
