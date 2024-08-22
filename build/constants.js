var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import os from "os";
import path from "path";
import fs from "fs/promises";
export const getAppDirectoryPath = () => __awaiter(void 0, void 0, void 0, function* () {
    const dirPath = path.resolve(os.homedir(), "rpg");
    try {
        yield fs.access(dirPath);
    }
    catch (_a) {
        yield fs.mkdir(path.dirname(dirPath), { recursive: true });
    }
    return dirPath;
});
