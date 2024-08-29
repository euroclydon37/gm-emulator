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
  updateGameState,
} from "../gameState.js";
import prompts from "prompts";

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

const AddFactCommand = {
  name: "Add fact",
  run: async () => {
    const name = await askForString("Give the fact a name: ");
    const value = await askForString("Type the fact: ");

    const appState = await loadAppState();
    const game = getCurrentGame(appState);

    await saveAppState(
      updateGameState(appState, addFact({ name, value }, game))
    );

    console.log(wrapOutput(chalk.yellow(`Added fact: ${name}: ${value}`)));
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

    await saveAppState(updateGameState(appState, removeFact(name, game)));
    console.log(wrapOutput(chalk.yellow(`Deleted log: ${name}`)));
  },
};

export const ManageFactsCommand = {
  name: "Facts",
  run: async () => {
    const command = await chooseCommand({
      question: "What do you want to do?",
      commands: [AddFactCommand, DeleteFactCommand, ListFactsCommand],
    });

    command.run();
  },
};
