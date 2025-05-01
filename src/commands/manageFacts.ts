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
import type { Command, Fact } from "../types.js";

function factToString(fact: Fact): string {
  const { name, value, details } = fact;

  return `${name} ${value}\n${Object.values(details)
    .map(factToString)
    .map((text) => `\n${text}`)
    .join("")}`;
}

async function findFact(): Promise<Fact | undefined> {
  const appState = await loadAppState();
  const game = getCurrentGame(appState);

  const factNames = Object.keys(game.facts);

  if (factNames.length === 0) {
    return;
  }

  const { name } = await prompts({
    type: "autocomplete",
    name: "name",
    message: "Which fact?",
    choices: factNames.map((name) => ({
      title: name,
      value: name,
    })),
  });

  return game.facts[name];
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
    const fact = await findFact();

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

const UpdateFactCommand: Command = {
  name: "Update Fact",
  run: async () => {
    const fact = await findFact();

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
    const fact = await findFact();

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
        UpdateFactCommand,
      ],
    });

    return command.run();
  },
};
