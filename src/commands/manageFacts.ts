import chalk from "chalk";
import {
  askForString,
  chooseCommand,
  loadAppState,
  saveAppState,
  wrapOutput,
} from "../utils.js";
import {
  addFact,
  getCurrentGame,
  removeFact,
  updateFact,
  updateGameState,
} from "../gameState.js";
import prompts from "prompts";
import type { Command, Fact, Factbook } from "../types.js";
import { Effect, pipe } from "effect";

class FactError extends Error {
  readonly _tag = "FactError";
  fact?: Fact;
}

const loadFacts = pipe(
  loadAppState,
  Effect.map(getCurrentGame),
  Effect.map((game) => game.facts),
);

function factToString(fact: Fact): string {
  const { name, value, details } = fact;

  return `\n${name} ${value}\n${Object.values(details)
    .map(factToString)
    .map((text) => `\n${text}`)
    .join("")}`;
}

const chooseFact = (
  factbook?: Factbook,
): Effect.Effect<Fact, FactError, never> =>
  pipe(
    loadFacts,
    Effect.map((facts) => ({
      factNames: Object.keys(facts),
      facts,
    })),
    Effect.flatMap(({ facts, factNames }) => {
      if (factNames.length === 0) {
        return Effect.fail(new FactError("no facts"));
      }

      const factOptions = factNames.map((name) => ({
        title: name,
        value: name,
      }));

      return Effect.succeed({
        facts,
        factNames,
        options: factbook
          ? [{ title: "Go back", value: "back" }, ...factOptions]
          : [{ title: "Exit", value: "exit" }, ...factOptions],
      });
    }),
    Effect.flatMap(({ facts, options, factNames }) =>
      Effect.tryPromise({
        try: async () => {
          const { choice } = await prompts({
            type: "autocomplete",
            name: "choice",
            message: "Which fact?",
            choices: options,
          });

          if (typeof choice !== "string") throw new Error("no choice made");

          return {
            facts,
            factNames,
            options,
            choice,
          };
        },
        catch: () => new FactError(),
      }),
    ),
    Effect.flatMap((input) => {
      if (input.choice === "back") {
        const error = new FactError("back");
        error.fact = input.facts[input.choice];
        return Effect.fail(error);
      }

      if (input.choice === "exit") {
        return Effect.fail(new FactError("exit"));
      }

      return Effect.succeed(input);
    }),
    Effect.flatMap((input) =>
      Effect.promise(async () => {
        const { next } = await prompts({
          type: "autocomplete",
          name: "next",
          message: "What next?",
          choices: [
            { title: "Show this", value: "stop" },
            { title: "Choose detail", value: "continue" },
          ],
        });

        if (typeof next !== "string") throw new Error();

        return { ...input, next };
      }),
    ),
    Effect.map(({ facts, choice }) => facts[choice]),
    Effect.matchEffect({
      onSuccess: (test) => Effect.succeed(test),
      onFailure: (error) => {
        if (error.message === "exit") return Effect.fail(error);
        if (error.message === "back") return chooseFact(error.fact?.details);
        return chooseFact();
      },
    }),
  );

const ListFactsCommand: Command = {
  __tag: "command",
  name: "List facts",
  run: pipe(
    loadAppState,
    Effect.map(getCurrentGame),
    Effect.map((game) => {
      return Object.keys(game.facts)
        .map((key) => game.facts[key])
        .map((fact) => `- ${fact.name}: ${fact.value}`);
    }),
    Effect.map((factStrings) =>
      factStrings.length === 0 ? "No facts available" : factStrings.join("\n"),
    ),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

const ExploreFactsCommand: Command = {
  __tag: "command",
  name: "Explore facts",
  run: pipe(
    chooseFact(),
    Effect.map(factToString),
    Effect.match({
      onSuccess: (text) => wrapOutput(chalk.yellow(text)),
      onFailure: (text) => wrapOutput(chalk.red(text)),
    }),
  ),
};

const AddFactCommand: Command = {
  __tag: "command",
  name: "Add fact",
  run: pipe(
    Effect.zip(
      askForString("Give the fact a name: "),
      askForString("Type the fact: "),
    ),
    Effect.map(([name, value]) => ({ name, value, details: {} })),
    Effect.map(addFact),
    Effect.map(updateGameState),
    Effect.flatMap(saveAppState),
    Effect.map(() => "Added fact"),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

const EditFactCommand: Command = {
  __tag: "command",
  name: "Edit fact",
  run: pipe(
    Effect.zip(chooseFact(), askForString("New value:")),
    Effect.map(([fact, value]) => ({
      name: fact.name,
      value,
      details: fact.details,
    })),
    Effect.map(updateFact),
    Effect.map(updateGameState),
    Effect.flatMap(saveAppState),
    Effect.map(() => "Fact updated."),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

const DeleteFactCommand: Command = {
  __tag: "command",
  name: "Delete fact",
  run: pipe(
    chooseFact(),
    Effect.map((fact) => fact.name),
    Effect.map(removeFact),
    Effect.map(updateGameState),
    Effect.flatMap(saveAppState),
    Effect.map(() => "Deleted fact"),
    Effect.map(chalk.yellow),
    Effect.map(wrapOutput),
  ),
};

export const ManageFactsCommand: Command = {
  __tag: "command",
  name: "Facts",
  run: chooseCommand({
    question: "What do you want to do?",
    commands: [
      AddFactCommand,
      DeleteFactCommand,
      ListFactsCommand,
      ExploreFactsCommand,
      EditFactCommand,
    ],
  }),
};
