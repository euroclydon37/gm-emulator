var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prompts from "prompts";
import { randomNumber, wrapOutput } from "../utils.js";
import chalk from "chalk";
const getAndButString = () => {
    const number = randomNumber(1, 100);
    if (number <= 10)
        return ", but...";
    if (number >= 90)
        return ", and...";
    return "";
};
const YesNo = {
    very_likely: {
        get: (x) => (x <= 90 ? "Yes" : "No"),
    },
    likely: {
        get: (x) => (x <= 70 ? "Yes" : "No"),
    },
    "50/50": {
        get: (x) => (x <= 50 ? "Yes" : "No"),
    },
    unlikely: {
        get: (x) => (x <= 30 ? "Yes" : "No"),
    },
    very_unlikely: {
        get: (x) => (x <= 10 ? "Yes" : "No"),
    },
};
export const OracleCommand = {
    name: "oracle",
    run: () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield prompts({
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
        const likelihood = response.likelihood;
        const answer = YesNo[likelihood].get(randomNumber(1, 100));
        const result = answer + getAndButString();
        console.log(wrapOutput(answer === "Yes" ? chalk.bgGreen(result) : chalk.bgRed(result)));
    }),
};
