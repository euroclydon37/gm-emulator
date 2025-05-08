import prompts from "prompts";
import path from "path";
import fs from "fs/promises";
import { AppError, AppState, Command } from "./types";
import { getAppDirectoryPath } from "./constants.js";
import { Effect } from "effect";

export const randomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const pickRandom = <T>(arr: T[]) => arr[randomNumber(0, arr.length - 1)];

export const runCommand = ({ run }: Command) => Effect.promise(run);

export const askForString = async (question: string): Promise<string> => {
  const { answer } = await prompts({
    type: "text",
    name: "answer",
    message: question,
  });
  return answer;
};

export const askForNumber = async (question: string): Promise<number> => {
  const { answer } = await prompts({
    type: "number",
    name: "answer",
    message: question,
  });
  return answer;
};

export const chooseCommand = async ({
  question,
  commands,
}: {
  question: string;
  commands: Command[];
}): Promise<Command> => {
  const { cmd } = await prompts({
    type: "autocomplete",
    name: "cmd",
    message: question,
    choices: commands.map((command) => ({
      title: command.name,
      value: command,
    })),
  });

  return cmd;
};

export const wrapOutput = (output: string) => {
  return "--------------------\n\n" + output + "\n\n--------------------";
};

export const loadAppState = async (): Promise<AppState> => {
  const appDirectoryPath = await getAppDirectoryPath();
  const appFilePath = path.resolve(appDirectoryPath, "app.json");
  const emptyAppState: AppState = {
    currentGame: undefined,
    games: [],
  };
  try {
    await fs.access(appFilePath);
  } catch {
    await fs.writeFile(appFilePath, JSON.stringify(emptyAppState), {
      encoding: "utf8",
    });
  }
  const appState = JSON.parse(await fs.readFile(appFilePath, "utf8"));
  return appState;
};

export const saveAppState = async (
  updater: (appState: AppState) => AppState,
) => {
  const appDirectoryPath = await getAppDirectoryPath();
  const appFilePath = path.resolve(appDirectoryPath, "app.json");

  await fs.writeFile(
    appFilePath,
    JSON.stringify(updater(await loadAppState()), null, 2),
    {
      encoding: "utf8",
    },
  );
};

export function isError(input: unknown): input is AppError {
  return !!input && (input as AppError).type === "error";
}
