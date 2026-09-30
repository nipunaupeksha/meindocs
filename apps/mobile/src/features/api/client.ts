import { aiAnalysisResponseSchema } from '@meindocs/schemas';
import type { AiAnalysisResponse } from '@meindocs/schemas';
import { getApiUrl } from '@meindocs/config';
import { AppError, withRetry } from '@meindocs/domain';
import { logger } from '@/lib/logger';

const apiUrl = getApiUrl(process.env.EXPO_PUBLIC_API_URL);

export async function analyzeDocumentWithApi(input: {
  documentId: string;
  ocrText: string;
  locale: string;
  mimeType?: string;
}): Promise<AiAnalysisResponse | null> {
  try {
    return await withRetry(
      async () => {
        const response = await fetch(`${apiUrl}/v1/ai/analyze-document`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!response.ok)
          throw new AppError(response.status >= 500 ? 'network' : 'ai', undefined, {
            retryable: response.status >= 500,
          });
        return aiAnalysisResponseSchema.parse(await response.json());
      },
      { attempts: 3 },
    );
  } catch (error) {
    logger.warn('ai_analysis_failed', error, { documentId: input.documentId });
    return null;
  }
}
