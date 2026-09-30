import type { LocalFileRecord } from './local-file-service';
import { extractText, type OcrOutput } from './ocr';
import { analyzeDocumentWithApi } from '@/features/api/client';
import type { AiAnalysisResponse } from '@meindocs/schemas';
import { toAppError } from '@meindocs/domain';

export type DocumentDraft = {
  file: LocalFileRecord;
  title: string;
  extractedText: string;
  ocrStatus: OcrOutput['status'];
  blockCount: number;
  analysis?: AiAnalysisResponse;
};

function titleFromName(name: string) {
  return (
    name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim() || 'New document'
  );
}

// fallow-ignore-next-line complexity
export async function processDocument(file: LocalFileRecord): Promise<DocumentDraft> {
  let ocr: OcrOutput;
  try {
    ocr = await extractText(file);
  } catch (error) {
    throw toAppError(error, 'ocr');
  }
  const analysis = ocr.text
    ? await analyzeDocumentWithApi({
        documentId: file.id,
        ocrText: ocr.text,
        locale: 'de-DE',
        mimeType: file.mimeType,
      })
    : null;
  return {
    file,
    title: titleFromName(file.originalName),
    extractedText: analysis?.extractedText ?? ocr.text,
    ocrStatus: ocr.status,
    blockCount: ocr.blockCount,
    analysis: analysis ?? undefined,
  };
}
