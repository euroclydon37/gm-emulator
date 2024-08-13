import prompts from "prompts";
import { randomNumber, wrapOutput } from "../utils.js";
import chalk from "chalk";

const getAndButString = () => {
  const number = randomNumber(1, 100);

  if (number <= 10) return ", but...";
  if (number >= 90) return ", and...";

  return "";
};

const YesNo = {
  very_likely: {
    get: (number) => (number <= 90 ? "Yes" : "No"),
  },
  likely: {
    get: (number) => (number <= 70 ? "Yes" : "No"),
  },
  "50/50": {
    get: (number) => (number <= 50 ? "Yes" : "No"),
  },
  unlikely: {
    get: (number) => (number <= 30 ? "Yes" : "No"),
  },
  very_unlikely: {
    get: (number) => (number <= 10 ? "Yes" : "No"),
  },
};

export const OracleCommand = {
  name: "oracle",
  run: async () => {
    const { likelihood } = await prompts({
      type: "autocomplete",
      name: "likelihood",
      message: "How likely is it?",
      choices: [
        { title: "Very likely", value: "very_likely" },
        { title: "Likely", value: "likely" },
        { title: "50/50", value: "50/50" },
        { title: "Unlikely", value: "unlikely" },
        { title: "Very unlikely", value: "very_unlikely" },
      ],
    });

    const answer = YesNo[likelihood].get(randomNumber(1, 100));
    const result = answer + getAndButString();

    console.log(
      wrapOutput(answer === "Yes" ? chalk.bgGreen(result) : chalk.bgRed(result))
    );
  },
};
