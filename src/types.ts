export interface Command {
  name: string;
  run: () => void;
}
