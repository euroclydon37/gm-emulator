import prompts from "prompts";

export const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const pickRandom = (arr) =>
  arr.length > 0 ? arr[randomNumber(0, arr.length - 1)] : undefined;

export const runCommand = ({ run }) => run();

export const chooseCommand = async ({ question, commands }) => {
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

export const wrapOutput = (output) => {
  return "--------------------\n" + output + "\n--------------------";
};
