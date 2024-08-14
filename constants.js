import os from "os";
import path from "path";

export const getAppDirectoryPath = async () => {
  const dirPath = path.resolve(os.homedir(), "rpg");
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(path.dirname(dirPath), { recursive: true });
  }
  return dirPath;
};
