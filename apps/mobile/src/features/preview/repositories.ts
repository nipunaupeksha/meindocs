import { initialDocuments, initialTasks, type MockDocument, type MockTask } from './data';

interface PreviewDocumentRepository {
  getById(id: string): Promise<MockDocument | null>;
  list(): Promise<MockDocument[]>;
  create(input: Omit<MockDocument, 'id'> & { id?: string }): Promise<MockDocument>;
  update(
    id: string,
    input: Partial<Pick<MockDocument, 'favorite' | 'reviewed' | 'category'>>,
  ): Promise<void>;
}

interface PreviewReminderRepository {
  list(): Promise<MockTask[]>;
  create(input: Omit<MockTask, 'id' | 'done'> & { id?: string }): Promise<MockTask>;
  update(id: string, input: Partial<Pick<MockTask, 'done' | 'notificationId'>>): Promise<void>;
}

function cloneDocuments(items: MockDocument[]) {
  return items.map((item) => ({ ...item, title: { ...item.title } }));
}

function cloneTasks(items: MockTask[]) {
  return items.map((item) => ({ ...item, title: { ...item.title } }));
}

export function createPreviewRepositories() {
  let documents = cloneDocuments(initialDocuments);
  let tasks = cloneTasks(initialTasks);

  const documentRepository: PreviewDocumentRepository = {
    async getById(id) {
      const document = documents.find((item) => item.id === id);
      return document ? { ...document, title: { ...document.title } } : null;
    },
    async list() {
      return cloneDocuments(documents);
    },
    async create(input) {
      const document = {
        ...input,
        id: input.id ?? `preview-document-${documents.length + 1}`,
      };
      documents = [document, ...documents];
      return { ...document, title: { ...document.title } };
    },
    async update(id, input) {
      documents = documents.map((item) => (item.id === id ? { ...item, ...input } : item));
    },
  };

  const reminderRepository: PreviewReminderRepository = {
    async list() {
      return cloneTasks(tasks);
    },
    async create(input) {
      const task = {
        ...input,
        id: input.id ?? `preview-reminder-${tasks.length + 1}`,
        done: false,
      };
      tasks = [task, ...tasks];
      return { ...task, title: { ...task.title } };
    },
    async update(id, input) {
      tasks = tasks.map((item) => (item.id === id ? { ...item, ...input } : item));
    },
  };

  return { documentRepository, reminderRepository };
}
