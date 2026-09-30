import { healthResponseSchema } from '@meindocs/schemas';
import {
  aiAnalysisResponseSchema,
  analyzeDocumentRequestSchema,
  taxMetadataSchema,
} from '@meindocs/schemas';
import Fastify from 'fastify';
import type { FastifyServerOptions } from 'fastify';
import type { z } from 'zod';
import { analyzeDocument, taxMetadataUpdate } from './analysis';

export function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify(options);
  type StoredAnalysis = Omit<z.infer<typeof aiAnalysisResponseSchema>, 'extractedText'>;
  const analyses = new Map<string, StoredAnalysis>();
  const taxReviews = new Map<string, z.infer<typeof taxMetadataSchema>>();

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, route: request.url }, 'request_failed');
    return reply.code(500).send({ error: 'The request could not be completed.' });
  });

  app.get<{ Reply: z.infer<typeof healthResponseSchema> }>('/health', async () => {
    return healthResponseSchema.parse({ status: 'ok' });
  });

  app.post('/v1/ai/analyze-document', async (request, reply) => {
    const parsed = analyzeDocumentRequestSchema.safeParse(request.body);
    if (!parsed.success)
      return reply
        .code(400)
        .send({ error: 'Invalid analysis request', issues: parsed.error.issues });
    const result = analyzeDocument(parsed.data);
    // OCR text is transient request data. Keep only structured metadata in the API process.
    const { extractedText: _extractedText, ...storedResult } = result;
    analyses.set(result.documentId, storedResult);
    if (result.taxSuggestion) taxReviews.set(result.documentId, result.taxSuggestion);
    return reply.code(200).send(result);
  });

  app.get<{ Params: { documentId: string } }>(
    '/v1/ai/analyses/:documentId',
    async (request, reply) => {
      const result = analyses.get(request.params.documentId);
      if (!result) return reply.code(404).send({ error: 'Analysis not found' });
      return reply.send(result);
    },
  );

  app.get<{ Params: { documentId: string } }>(
    '/v1/documents/:documentId/tax',
    async (request, reply) => {
      const tax = taxReviews.get(request.params.documentId);
      if (!tax) return reply.code(404).send({ error: 'Tax review not found' });
      return reply.send({ documentId: request.params.documentId, tax });
    },
  );

  app.put<{ Params: { documentId: string } }>(
    '/v1/documents/:documentId/tax',
    async (request, reply) => {
      const parsed = taxMetadataSchema.safeParse(request.body);
      if (!parsed.success)
        return reply.code(400).send({ error: 'Invalid tax metadata', issues: parsed.error.issues });
      const tax = taxMetadataUpdate(parsed.data);
      taxReviews.set(request.params.documentId, tax);
      return reply.code(200).send({ documentId: request.params.documentId, tax });
    },
  );

  app.get<{ Querystring: { year?: string } }>('/v1/tax/summary', async (request) => {
    const year = request.query.year ? Number(request.query.year) : undefined;
    const entries = [...taxReviews.values()].filter(
      (tax) => year === undefined || tax.taxYear === year,
    );
    return {
      taxYear: year,
      documentCount: entries.length,
      taxRelevantCount: entries.filter((tax) => tax.taxRelevant).length,
      grossAmount: entries.reduce((sum, tax) => sum + (tax.grossAmount ?? 0), 0),
      netAmount: entries.reduce((sum, tax) => sum + (tax.netAmount ?? 0), 0),
      vatAmount: entries.reduce((sum, tax) => sum + (tax.vatAmount ?? 0), 0),
      needsReviewCount: entries.filter((tax) => tax.reviewStatus === 'needs_review').length,
    };
  });

  return app;
}
