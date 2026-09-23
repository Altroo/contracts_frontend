export const runWithCleanup = async <T>(action: () => Promise<T>, cleanup: () => void): Promise<T> => {
  try {
    return await action();
  } finally {
    cleanup();
  }
};
