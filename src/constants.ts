import os from "os";
import path from "path";
import fs from "fs/promises";

export const getAppDirectoryPath = async () => {
  const dirPath = path.resolve(os.homedir(), "rpg");
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath);
  }
  return dirPath;
};
