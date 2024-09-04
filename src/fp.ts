export const last = <T>(arr: ReadonlyArray<T>): T => arr[arr.length - 1];

export const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (arg: T) =>
    fns.reduce((acc, fn) => fn(acc), arg);
