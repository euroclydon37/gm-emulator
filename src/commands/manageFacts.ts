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
import type { AppError, Command, Fact, Factbook } from "../types.js";

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

  const { choice } = await prompts({
    type: "autocomplete",
    name: "choice",
    message: "Which fact?",
    choices: factNames.map((name) => ({
      title: name,
      value: name,
    })),
  });

  return facts[choice];
}

const ListFactsCommand: Command = {
  name: "List facts",
  run: async () => {
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    const facts = Object.keys(game.facts)
      .map((key) => game.facts[key])
      .map((fact) => `- ${fact.name}: ${fact.value}`);

    const message =
      facts.length === 0 ? "No facts available" : facts.join("\n");

    return wrapOutput(chalk.yellow(message));
  },
};

const ExploreFactsCommand: Command = {
  name: "Explore facts",
  run: async () => {
    const fact = await chooseFact();

    if (!fact) return wrapOutput(chalk.red("No facts exist."));

    return wrapOutput(chalk.yellow(factToString(fact)));
  },
};

const AddFactCommand: Command = {
  name: "Add fact",
  run: async () => {
    const name = await askForString("Give the fact a name: ");
    const value = await askForString("Type the fact: ");

    await saveAppState(updateGameState(addFact({ name, value, details: {} })));

    return wrapOutput(chalk.yellow(`Added fact: ${name}: ${value}`));
  },
};

const EditFactCommand: Command = {
  name: "Edit fact",
  run: async () => {
    const fact = await chooseFact();

    if (!fact) return wrapOutput(chalk.red("No facts exist."));

    const value = await askForString("New value:");

    await saveAppState(
      updateGameState(
        updateFact({ name: fact.name, value, details: fact.details }),
      ),
    );

    return wrapOutput(chalk.yellow(`Updated to: ${value}`));
  },
};

const DeleteFactCommand: Command = {
  name: "Delete fact",
  run: async () => {
    const fact = await chooseFact();

    if (!fact) return wrapOutput(chalk.red("No facts exist."));

    await saveAppState(updateGameState(removeFact(fact.name)));

    return wrapOutput(chalk.yellow(`Deleted log: ${fact.name}`));
  },
};

export const ManageFactsCommand: Command = {
  name: "Facts",
  run: async () => {
    const command = await chooseCommand({
      question: "What do you want to do?",
      commands: [
        AddFactCommand,
        DeleteFactCommand,
        ListFactsCommand,
        ExploreFactsCommand,
        EditFactCommand,
      ],
    });

    return command.run();
  },
};
