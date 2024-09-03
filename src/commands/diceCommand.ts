import prompts from "prompts";
import { randomNumber, wrapOutput } from "../utils.js";
import chalk from "chalk";

const rollDiceCombo = (combo: string) => {
  const dice = combo.split("d");
  const numDice = parseInt(dice[0]);
  const dieSize = parseInt(dice[1]);
  return Array.from(
    { length: numDice },
    () => `d${dieSize}: ${randomNumber(1, dieSize)}`
  );
};

export const DiceCommand = {
  name: "Dice",
  run: async () => {
    const { dice_combo } = await prompts({
      type: "text",
      name: "dice_combo",
      message: "What combo? (e.g. 1d20+1d6)",
    });

    const combos: string[] = dice_combo.split("+");

    console.log(
      wrapOutput(chalk.yellow(combos.map(rollDiceCombo).flat().join("\n")))
    );
  },
};
