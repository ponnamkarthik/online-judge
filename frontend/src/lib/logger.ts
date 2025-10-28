// Simple logger that no-ops in production builds
const isDev = import.meta.env.DEV;

type ConsoleFn = (...args: unknown[]) => void;

function make(method: keyof Console): ConsoleFn {
  if (isDev) {
    return (...args: unknown[]) => {
      (console[method] as (...args: unknown[]) => void)(...args);
    };
  }
  return () => {};
}

export const logger = {
  debug: make("log"),
  info: make("info"),
  warn: make("warn"),
  error: make("error"),
};

export default logger;
