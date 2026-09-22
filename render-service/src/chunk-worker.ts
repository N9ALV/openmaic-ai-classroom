import { renderChunk } from '@hyperframes/producer/distributed';
import { finishWorker } from './worker-result';

interface ChunkMessage {
  planDir: string;
  chunkIndex: number;
  outputPath: string;
}

process.once('message', async (message: ChunkMessage) => {
  try {
    const result = await renderChunk(message.planDir, message.chunkIndex, message.outputPath);
    finishWorker({ ok: true, result }, 0);
  } catch (error) {
    finishWorker(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      1,
    );
  }
});
