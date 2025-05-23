import prompts from "prompts";
import { randomNumber, wrapOutput } from "../utils.js";
import chalk from "chalk";
import { Command } from "../types.js";
import { Effect, pipe } from "effect";

const getAndButString = pipe(
  randomNumber(1, 100),
  Effect.map((number) => {
    if (number <= 10) return ", but...";
    if (number >= 90) return ", and...";

    return "";
  }),
);

const YesNo = {
  very_likely: {
    get: (x: number) => (x <= 90 ? "Yes" : "No"),
  },
  likely: {
    get: (x: number) => (x <= 70 ? "Yes" : "No"),
  },
  "50/50": {
    get: (x: number) => (x <= 50 ? "Yes" : "No"),
  },
  unlikely: {
    get: (x: number) => (x <= 30 ? "Yes" : "No"),
  },
  very_unlikely: {
    get: (x: number) => (x <= 10 ? "Yes" : "No"),
  },
};

export const OracleCommand: Command = {
  __tag: "command",
  name: "Oracle",
  run: Effect.Do.pipe(
    Effect.bind("randomNumber", () => randomNumber(1, 100)),
    Effect.bind("andButString", () => getAndButString),
    Effect.flatMap(({ randomNumber, andButString }) =>
      Effect.promise(async () => {
        const response = await prompts({
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

        const likelihood: keyof typeof YesNo = response.likelihood;

        return YesNo[likelihood].get(randomNumber) + andButString;
      }),
    ),
    Effect.map((answer) =>
      answer.startsWith("Yes") ? chalk.green(answer) : chalk.red(answer),
    ),
    Effect.map(wrapOutput),
  ),
};
