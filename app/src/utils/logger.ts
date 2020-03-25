export const info = (message: string) => console.log(`[${new Date().toLocaleTimeString()}]:: ${message}`);

export const logger = {
  info,
};
