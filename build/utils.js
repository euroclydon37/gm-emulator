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
export const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
export const pickRandom = (arr) => arr[randomNumber(0, arr.length - 1)];
export const runCommand = ({ run }) => run();
export const chooseCommand = (_a) => __awaiter(void 0, [_a], void 0, function* ({ question, commands, }) {
    const { cmd } = yield prompts({
        type: "autocomplete",
        name: "cmd",
        message: question,
        choices: commands.map((command) => ({
            title: command.name,
            value: command,
        })),
    });
    return cmd;
});
export const wrapOutput = (output) => {
    return "--------------------\n" + output + "\n--------------------";
};
