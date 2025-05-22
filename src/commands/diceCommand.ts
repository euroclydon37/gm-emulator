import prompts from "prompts";
import {
  askForString,
  chooseCommand,
  loadAppState,
  randomNumber,
  rollDie,
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
import type { Command, GameState } from "../types.js";
import { Effect, pipe } from "effect";

const getDiceCombo =
  (message: string) =>
  (game: GameState): Effect.Effect<string, Error, never> =>
    Effect.tryPromise({
      try: async () => {
        const { combo } = await prompts({
          type: "autocomplete",
          name: "combo",
          message,
          choices: Object.keys(getNamedDicePools(game)).map((name) => ({
            title: name,
            value: name,
          })),
        });

        if (!combo) throw new Error();

        return combo;
      },
      catch: () => new Error("No combo chosen"),
    });

// A combo is a string like "2d6" or "1d20"
const rollSimilarDice = (combo: string) =>
  pipe(
    Effect.sync(() => {
      const dice = combo.split("d");
      const numDice = parseInt(dice[0]);
      const dieSize = parseInt(dice[1]);
      return Array.from({ length: numDice }, () => dieSize);
    }),
    Effect.flatMap(Effect.forEach(rollDie)),
    Effect.map((results) => results),
  );

// A dice pool is a string like "2d6+1d4+1d8"
const rollDicePool = (dicePool: string) =>
  pipe(
    Effect.succeed(dicePool),
    Effect.map(saveLastDicePool),
    Effect.map(updateGameState),
    Effect.flatMap(saveAppState),
    Effect.map(() => dicePool.split("+")),
    Effect.flatMap((pool) =>
      Effect.forEach(pool, (dice) => rollSimilarDice(dice)),
    ),
    Effect.map((results) => results.flat()),
  );

const rollCustomDice = () =>
  pipe(
    askForString("Describe your dice pool. (e.g. 1d20+1d6)"),
    Effect.flatMap(rollDicePool),
  );

const SaveNamedDicePoolCommand: Command = {
  __tag: "command",
  name: "Add named dice pool",
  run: pipe(
    Effect.zip(
      askForString("What is the name of the dice pool?"),
      askForString("Describe the pool. (e.g. 1d20+1d6) "),
    ),
    Effect.map(saveNamedDicePool),
    Effect.map(updateGameState),
    Effect.flatMap(saveAppState),
    Effect.map(() => wrapOutput(chalk.green("Dice combo saved"))),
  ),
};

const RemoveNamedDicePoolCommand: Command = {
  __tag: "command",
  name: "Remove named dice pool",
  run: pipe(
    loadAppState,
    Effect.map(getCurrentGame),
    Effect.flatMap(getDiceCombo("Which dice pool do you want to remove?")),
    Effect.map(removeNamedDicePool),
    Effect.map(updateGameState),
    Effect.flatMap(saveAppState),
    Effect.map(() => wrapOutput(chalk.green("Dice combo removed"))),
  ),
};

const RollDiceCommand: Command = {
  __tag: "command",
  name: "Roll",
  run: Effect.Do.pipe(
    () => loadAppState,
    Effect.bind("game", (appState) => Effect.succeed(getCurrentGame(appState))),
    Effect.bind("rollHistory", ({ game }) =>
      Effect.succeed(getRollHistory(game)),
    ),
    Effect.bind("namedDicePools", ({ game }) =>
      Effect.succeed(getNamedDicePools(game)),
    ),
    Effect.map(({ rollHistory, namedDicePools }) =>
      rollHistory
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
        .concat([{ title: "Custom", value: "custom" }]),
    ),
    Effect.flatMap(
      (choices): Effect.Effect<string, Error, never> =>
        Effect.tryPromise({
          try: async () => {
            const { dice_combo } = await prompts({
              type: "autocomplete",
              name: "dice_combo",
              message: "What combo? (e.g. 1d20+1d6)",
              choices,
            });

            if (!dice_combo) throw new Error();

            return dice_combo;
          },
          catch: () =>
            new Error(
              "No dice pool selected.\n\nYou might have typed a custom dice pool. To do that, you'll first need to select 'Custom'.",
            ),
        }),
    ),
    Effect.flatMap((combo) =>
      combo === "custom" ? rollCustomDice() : rollDicePool(combo),
    ),
    Effect.map((results) => results.join("\n")),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

export const DiceCommand: Command = {
  __tag: "command",
  name: "Dice",
  run: chooseCommand({
    question: "What do you want to do?",
    commands: [
      RollDiceCommand,
      SaveNamedDicePoolCommand,
      RemoveNamedDicePoolCommand,
    ],
  }),
};
