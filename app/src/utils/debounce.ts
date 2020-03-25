export const debounce = <T extends any[], R>(f: (...args: T) => R, ms: number) => {
  let timer!: any;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      f(...args);
    }, ms);
  };
};
