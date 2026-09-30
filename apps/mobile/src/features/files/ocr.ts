import MlkitOcr from 'rn-mlkit-ocr';
import type { LocalFileRecord } from './local-file-service';
import { AppError, withRetry } from '@meindocs/domain';
import { logger } from '@/lib/logger';

export type OcrStatus = 'completed' | 'needs-review' | 'unsupported';

export type OcrOutput = {
  status: OcrStatus;
  text: string;
  blockCount: number;
};

export async function extractText(file: LocalFileRecord): Promise<OcrOutput> {
  if (file.kind === 'pdf') {
    return { status: 'unsupported', text: '', blockCount: 0 };
  }
  let result;
  try {
    result = await withRetry(() => MlkitOcr.recognizeText(file.localUri, 'latin'), { attempts: 2 });
  } catch (error) {
    logger.warn('ocr_failed', error, { fileId: file.id, kind: file.kind });
    throw new AppError('ocr', undefined, { cause: error, retryable: true });
  }
  const text = result.text.trim();
  return {
    status: text ? 'completed' : 'needs-review',
    text,
    blockCount: result.blocks.length,
  };
}
