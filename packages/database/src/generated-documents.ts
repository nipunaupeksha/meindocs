import { DocumentRelationType } from '@meindocs/domain';
import { documentRelations } from './schema';

type Db = ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>;

export async function linkGeneratedDocument(
  db: Db,
  generatedDocumentId: string,
  sourceDocumentIds: string[],
) {
  if (!sourceDocumentIds.length) return;
  await db
    .insert(documentRelations)
    .values(
      sourceDocumentIds.map((sourceDocumentId) => ({
        id: crypto.randomUUID(),
        sourceDocumentId: generatedDocumentId,
        targetDocumentId: sourceDocumentId,
        relationType: DocumentRelationType.GenerationFrom,
      })),
    )
    .onConflictDoNothing();
}
