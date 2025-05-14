import chalk from "chalk";
import {
  askForString,
  chooseCommand,
  isError,
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
import type { AppError, Command, Fact, Factbook } from "../types.js";
import { Effect } from "effect";

async function loadFacts() {
  const appState = await loadAppState();
  const game = getCurrentGame(appState);
  return game.facts;
}

function factToString(fact: Fact): string {
  const { name, value, details } = fact;

  return `\n${name} ${value}\n${Object.values(details)
    .map(factToString)
    .map((text) => `\n${text}`)
    .join("")}`;
}

async function chooseFact(factbook?: Factbook): Promise<Fact | AppError> {
  const facts = factbook ?? (await loadFacts());
  const factNames = Object.keys(facts);

  if (factNames.length === 0) {
    return { type: "error", message: "No facts to choose from" };
  }

  const factOptions = factNames.map((name) => ({
    title: name,
    value: name,
  }));

  const options = factbook
    ? [{ title: "Go back", value: "back" }, ...factOptions]
    : [{ title: "Exit", value: "exit" }, ...factOptions];

  const { choice } = await prompts({
    type: "autocomplete",
    name: "choice",
    message: "Which fact?",
    choices: options,
  });

  if (choice === "back") {
    return { type: "error", message: "back" };
  }

  if (choice === "exit") {
    return { type: "error", message: "exit" };
  }

  const { next } = await prompts({
    type: "autocomplete",
    name: "next",
    message: "What next?",
    choices: [
      { title: "Show this", value: "stop" },
      { title: "Choose detail", value: "continue" },
    ],
  });

  const fact = facts[choice];

  if (next === "continue") {
    const nextFact = await chooseFact(fact.details);
    if (isError(nextFact) && nextFact.message === "back")
      return chooseFact(factbook);
    return nextFact;
  }

  return fact;
}

const ListFactsCommand: Command = {
  __tag: "command",
  name: "List facts",
  run: Effect.promise(async () => {
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    const facts = Object.keys(game.facts)
      .map((key) => game.facts[key])
      .map((fact) => `- ${fact.name}: ${fact.value}`);

    const message =
      facts.length === 0 ? "No facts available" : facts.join("\n");

    return wrapOutput(chalk.yellow(message));
  }),
};

const ExploreFactsCommand: Command = {
  __tag: "command",
  name: "Explore facts",
  run: Effect.promise(async () => {
    const fact = await chooseFact();

    if (isError(fact)) {
      const message = fact.message === "exit" ? "No fact chosen" : fact.message;
      return wrapOutput(chalk.red(message));
    }

    return wrapOutput(chalk.yellow(factToString(fact)));
  }),
};

const AddFactCommand: Command = {
  __tag: "command",
  name: "Add fact",
  run: Effect.promise(async () => {
    const name = await askForString("Give the fact a name: ");
    const value = await askForString("Type the fact: ");

    await saveAppState(updateGameState(addFact({ name, value, details: {} })));

    return wrapOutput(chalk.yellow(`Added fact: ${name}: ${value}`));
  }),
};

const EditFactCommand: Command = {
  __tag: "command",
  name: "Edit fact",
  run: Effect.promise(async () => {
    const fact = await chooseFact();

    if (isError(fact)) return wrapOutput(chalk.red("No facts exist."));

    const value = await askForString("New value:");

    await saveAppState(
      updateGameState(
        updateFact({ name: fact.name, value, details: fact.details }),
      ),
    );

    return wrapOutput(chalk.yellow(`Updated to: ${value}`));
  }),
};

const DeleteFactCommand: Command = {
  __tag: "command",
  name: "Delete fact",
  run: Effect.promise(async () => {
    const fact = await chooseFact();

    if (isError(fact)) return wrapOutput(chalk.red("No facts exist."));

    await saveAppState(updateGameState(removeFact(fact.name)));

    return wrapOutput(chalk.yellow(`Deleted log: ${fact.name}`));
  }),
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
