import prompts from "prompts";
import {
  askForString,
  chooseCommand,
  loadAppState,
  randomNumber,
  saveAppState,
  wrapOutput,
} from "../utils.js";
import chalk from "chalk";
import {
  getCurrentGame,
  getNamedDicePools,
  getRollHistory,
  removeNamedDicePool,
  saveLastDicePool,
  saveNamedDicePool,
  updateGameState,
} from "../gameState.js";
import type { Command } from "../types.js";

const rollSimilarDice = (combo: string) => {
  const dice = combo.split("d");
  const numDice = parseInt(dice[0]);
  const dieSize = parseInt(dice[1]);
  return Array.from(
    { length: numDice },
    () => `d${dieSize}: ${randomNumber(1, dieSize)}`,
  );
};

const rollDicePool = async (dicePool: string) => {
  // Save the dice roll to history
  await saveAppState(updateGameState(saveLastDicePool(dicePool)));

  return dicePool.split("+").map(rollSimilarDice).flat();
};

const rollCustomDice = async () => {
  const dicePool = await askForString(
    "Describe your dice pool. (e.g. 1d20+1d6)",
  );
  const rollResults = await rollDicePool(dicePool);
  return wrapOutput(chalk.yellow(rollResults.join("\n")));
};

const SaveNamedDicePoolCommand: Command<string> = {
  name: "Add named dice pool",
  run: async () => {
    const name = await askForString("What is the name of the dice pool?");
    const combo = await askForString("Describe the pool. (e.g. 1d20+1d6) ");

    await saveAppState(updateGameState(saveNamedDicePool(name, combo)));
    return wrapOutput(chalk.green("Dice combo saved"));
  },
};

const RemoveNamedDicePoolCommand: Command<string> = {
  name: "Remove named dice pool",
  run: async () => {
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    const { combo } = await prompts({
      type: "autocomplete",
      name: "combo",
      message: "Which dice pool do you want to remove?",
      choices: Object.keys(getNamedDicePools(game)).map((name) => ({
        title: name,
        value: name,
      })),
    });

    await saveAppState(updateGameState(removeNamedDicePool(combo)));
    return wrapOutput(chalk.green("Dice combo removed"));
  },
};

const RollDiceCommand: Command<string> = {
  name: "Roll",
  run: async () => {
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    const rollHistory = getRollHistory(game);
    const namedDicePools = getNamedDicePools(game);

    const choices = rollHistory
      .map((dicePool) => ({
        title: dicePool,
        value: dicePool,
      }))
      .concat(
        Object.keys(namedDicePools).map((key) => ({
          title: key,
          value: namedDicePools[key],
        })),
      )
      .concat([{ title: "Custom", value: "custom" }]);

    const { dice_combo } = await prompts({
      type: "autocomplete",
      name: "dice_combo",
      message: "What combo? (e.g. 1d20+1d6)",
      choices,
    });

    if (!dice_combo) {
      return wrapOutput(
        chalk.yellow(
          "No dice pool selected.\n\nYou might have typed a custom dice pool. To do that, you'll first need to select 'Custom'.",
        ),
      );
    }

    if (dice_combo === "custom") {
      return rollCustomDice();
    }

    const results = await rollDicePool(dice_combo);

    return wrapOutput(chalk.yellow(results.join("\n")));
  },
};

export const DiceCommand: Command<string> = {
  name: "Dice",
  run: async () => {
    const command = await chooseCommand({
      question: "What do you want to do?",
      commands: [
        RollDiceCommand,
        SaveNamedDicePoolCommand,
        RemoveNamedDicePoolCommand,
      ],
    });

    return command.run();
  },
};
