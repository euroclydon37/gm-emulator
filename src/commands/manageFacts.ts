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

async function findFact() {
  const appState = await loadAppState();
  const game = getCurrentGame(appState);

  const factNames = Object.keys(game.facts);

  if (factNames.length === 0) {
    console.log(wrapOutput(chalk.yellow("No facts to read")));
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

const ListFactsCommand = {
  name: "List facts",
  run: async () => {
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    const facts = Object.keys(game.facts)
      .map((key) => game.facts[key])
      .map((fact) => `- ${fact.name}: ${fact.value}`);

    const message =
      facts.length === 0 ? "No facts available" : facts.join("\n");

    console.log(wrapOutput(chalk.yellow(message)));
  },
};

const ReadFactCommand = {
  name: "Find a fact",
  run: async () => {
    const fact = await findFact();

    const message = fact ? `${fact.name}: ${fact.value}` : "Fact not found.";

    console.log(wrapOutput(chalk.yellow(message)));
  },
};

const AddFactCommand = {
  name: "Add fact",
  run: async () => {
    const name = await askForString("Give the fact a name: ");
    const value = await askForString("Type the fact: ");

    await saveAppState(updateGameState(addFact({ name, value })));

    console.log(wrapOutput(chalk.yellow(`Added fact: ${name}: ${value}`)));
  },
};

const UpdateFactCommand = {
  name: "Update Fact",
  run: async () => {
    const fact = await findFact();
    if (!fact) return;

    const value = await askForString("New value:");

    await saveAppState(updateGameState(updateFact({ name: fact.name, value })));

    console.log(wrapOutput(chalk.yellow(`Updated to: ${value}`)));
  },
};

const DeleteFactCommand = {
  name: "Delete fact",
  run: async () => {
    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    const factNames = Object.keys(game.facts);

    if (factNames.length === 0) {
      console.log(wrapOutput(chalk.yellow("No facts to delete")));
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

    await saveAppState(updateGameState(removeFact(name)));

    console.log(wrapOutput(chalk.yellow(`Deleted log: ${name}`)));
  },
};

export const ManageFactsCommand = {
  name: "Facts",
  run: async () => {
    const command = await chooseCommand({
      question: "What do you want to do?",
      commands: [
        AddFactCommand,
        DeleteFactCommand,
        ListFactsCommand,
        ReadFactCommand,
        UpdateFactCommand,
      ],
    });

    command.run();
  },
};
