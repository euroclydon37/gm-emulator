import prompts from "prompts";
import path from "path";
import fs from "fs/promises";
import { AppError, AppState, AutocompleteOption, Command } from "./types";
import { getAppDirectoryPath } from "./constants.js";
import { Effect, pipe } from "effect";

class FileWriteError extends Error {
  constructor(path: string) {
    super(`Failed to read file: ${path}`);
  }
  __tag = "FileWriteError";
}

const writeFile = ({ filePath, data }: { filePath: string; data: string }) =>
  Effect.tryPromise({
    try: () => fs.writeFile(filePath, data, { encoding: "utf8" }),
    catch: () => new FileWriteError(filePath),
  });

const isDefined = <T>(x: T | undefined | null): x is T =>
  x !== undefined && x !== null;

const getAppDataFilePath = (appDirectoryPath: string) =>
  path.resolve(appDirectoryPath, "app.json");

export const randomNumber = (
  min: number,
  max: number,
): Effect.Effect<number, never, never> =>
  Effect.succeed(Math.floor(Math.random() * (max - min + 1) + min));

export const rollDie = (sides: number): Effect.Effect<number, never, never> =>
  randomNumber(1, sides);

export const pickRandom = <T>(arr: T[]): Effect.Effect<T, never, never> =>
  pipe(
    randomNumber(0, arr.length - 1),
    Effect.map((index) => arr[index]),
  );

const promptAutocomplete = <T>(
  question: string,
  choices: AutocompleteOption<T>[],
): Effect.Effect<T, Error, never> =>
  Effect.tryPromise({
    try: async () => {
      const { cmd } = await prompts({
        type: "autocomplete",
        name: "cmd",
        message: question,
        choices,
      });

      return cmd;
    },
    catch: () => new Error("Problem with autocomplete"),
  });

export const runCommand = (
  command: Command,
): Effect.Effect<string, Error, never> =>
  pipe(
    command.run,
    Effect.flatMap((result) =>
      typeof result === "string" ? Effect.succeed(result) : runCommand(result),
    ),
  );

export const askForString = (
  question: string,
): Effect.Effect<string, Error, never> =>
  Effect.promise(async () => {
    const { answer } = await prompts({
      type: "text",
      name: "answer",
      message: question,
    });

    if (typeof answer !== "string" || answer.length === 0)
      throw new Error("Nothing entered.");

    return answer;
  });

export const askForNumber = (
  question: string,
): Effect.Effect<number, Error, never> =>
  Effect.promise(async () => {
    const { answer } = await prompts({
      type: "number",
      name: "answer",
      message: question,
    });

    if (typeof answer !== "number")
      throw Error("Entered a non-number when expecting a number");

    return answer;
  });

export const chooseCommand = ({
  question,
  commands,
}: {
  question: string;
  commands: Command[];
}) =>
  promptAutocomplete(
    question,
    commands.map((command) => ({
      title: command.name,
      value: command,
    })),
  );

export const wrapOutput = (output: string) => {
  return "--------------------\n\n" + output + "\n\n--------------------";
};

export const loadAppState = pipe(
  getAppDirectoryPath,
  Effect.map(getAppDataFilePath),
  Effect.flatMap((appFilePath) =>
    Effect.promise(async (): Promise<AppState> => {
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
    }),
  ),
);

export const saveAppState = (updater: (appState: AppState) => AppState) =>
  pipe(
    Effect.zip(loadAppState, getAppDirectoryPath),
    Effect.map(([state, folderPath]) => ({
      data: JSON.stringify(updater(state), null, 2),
      filePath: path.resolve(folderPath, "app.json"),
    })),
    Effect.flatMap(writeFile),
  );

export function isError(input: unknown): input is AppError {
  return !!input && (input as AppError).type === "error";
}

export function isCommand(maybeCommand: unknown): maybeCommand is Command {
  return (
    isDefined(maybeCommand) && (maybeCommand as Command).__tag === "command"
  );
}
