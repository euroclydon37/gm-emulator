import os from "os";
import path from "path";
import fs from "fs/promises";
import { Effect } from "effect";

export const getAppDirectoryPath = Effect.tryPromise({
  try: async () => {
    const dirPath = path.resolve(os.homedir(), "rpg");
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath);
    }
    return dirPath;
  },
  catch: () => new Error("Could not get app directory path"),
});
