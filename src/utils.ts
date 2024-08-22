import prompts from "prompts";
import { Command } from "./types";

export const randomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const pickRandom = <T>(arr: T[]) => arr[randomNumber(0, arr.length - 1)];

export const runCommand = ({ run }: Command) => run();

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
  return "--------------------\n" + output + "\n--------------------";
};
