export function lazyOnce(factory: () => Promise<void>) {
  let promise: Promise<void> | undefined;

  return () => {
    promise ??= factory();
    return promise;
  };
}
