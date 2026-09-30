import type { Case, CaseChecklistItem } from './index';
import type { CaseRepository, CreateCaseInput } from './repositories';

export function caseProgress(caseItem: Pick<Case, 'checklist'>) {
  if (!caseItem.checklist.length) return 0;
  return Math.round(
    (caseItem.checklist.filter((item) => item.completed).length / caseItem.checklist.length) * 100,
  );
}

export class CaseService {
  constructor(private readonly repository: CaseRepository) {}
  create(input: CreateCaseInput) {
    return this.repository.create(input);
  }
  get(id: string) {
    return this.repository.getById(id);
  }
  list() {
    return this.repository.list();
  }
  addDocument(caseId: string, documentId: string) {
    return this.repository.addDocument(caseId, documentId);
  }
  addChecklistItem(caseId: string, title: string, dueDate?: string) {
    return this.repository.addChecklistItem(caseId, title, dueDate);
  }
  completeChecklistItem(itemId: string, completed = true) {
    return this.repository.completeChecklistItem(itemId, completed);
  }
  async complete(caseId: string) {
    await this.repository.update(caseId, { status: 'completed' as Case['status'] });
  }
  static progress(items: CaseChecklistItem[]) {
    return caseProgress({ checklist: items });
  }
}
