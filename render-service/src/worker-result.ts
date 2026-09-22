/** Flush the IPC result before exiting; a rejected renderer may leave handles open. */
export function finishWorker(
  result: unknown,
  code: number,
  host: Pick<NodeJS.Process, 'send' | 'exit'> = process,
): void {
  let finished = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const exit = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    host.exit(code);
  };
  timer = setTimeout(exit, 5_000);
  try {
    if (host.send) host.send(result, () => exit());
    else exit();
  } catch {
    exit();
  }
}
