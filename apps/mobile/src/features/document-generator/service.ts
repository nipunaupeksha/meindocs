import { File, Directory, Paths } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import {
  DocumentGeneratorService,
  type GeneratedDocument,
  type TemplateLanguage,
} from '@meindocs/domain';

const generator = new DocumentGeneratorService();
const generatedDirectory = new Directory(Paths.document, 'files', 'generated');

function pdfDocument(text: string) {
  const escaped = text
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
    .replaceAll('\n', ') Tj 0 -16 Td (');
  const stream = `BT /F1 11 Tf 50 760 Td (${escaped}) Tj ET`;
  return `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n5 0 obj<</Length ${stream.length}>>stream\n${stream}\nendstream endobj\ntrailer<</Root 1 0 R>>\n%%EOF`;
}

class MobileDocumentGeneratorService {
  private readonly generator = generator;
  listTemplates() {
    return this.generator.getTemplates();
  }
  render(templateId: string, language: TemplateLanguage, values: Record<string, string>) {
    return this.generator.render(templateId, language, values);
  }
  async generate(input: {
    templateId: string;
    language: TemplateLanguage;
    values: Record<string, string>;
    sourceDocumentIds?: string[];
    sourceCaseId?: string;
  }): Promise<GeneratedDocument> {
    const rendered = this.render(input.templateId, input.language, input.values);
    const id = Crypto.randomUUID();
    const createdAt = new Date().toISOString();
    if (!generatedDirectory.exists)
      generatedDirectory.create({ idempotent: true, intermediates: true });
    const textFile = new File(generatedDirectory, `${id}.txt`);
    const pdfFile = new File(generatedDirectory, `${id}.pdf`);
    textFile.write(rendered.content);
    pdfFile.write(pdfDocument(rendered.content));
    return {
      id,
      title: rendered.template.title[input.language],
      content: rendered.content,
      mimeType: 'text/plain',
      createdAt,
      generatedFromTemplate: input.templateId,
      sourceDocumentIds: input.sourceDocumentIds ?? [],
      sourceCaseId: input.sourceCaseId,
      storageUri: textFile.uri,
      pdfUri: pdfFile.uri,
    };
  }
}

export const mobileDocumentGenerator = new MobileDocumentGeneratorService();
