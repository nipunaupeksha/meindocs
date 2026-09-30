export type DashboardDocument = {
  id: string;
  title: string;
  createdAt: string;
  requiresReview: boolean;
  expiryDate?: string;
  isReceipt?: boolean;
  businessExpense?: number;
};
export type DashboardTask = {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  documentId?: string;
};
export type DashboardCase = {
  id: string;
  title: string;
  status: string;
  completedItems: number;
  totalItems: number;
};
export type DashboardTax = {
  year: number;
  unreviewedReceipts: number;
  trackedBusinessExpenses: number;
};
export type DashboardAttention = {
  id: string;
  title: string;
  kind: 'overdue' | 'due_soon' | 'expiry' | 'review';
  date?: string;
  priority: number;
};
export type DashboardSummary = {
  needsAttention: DashboardAttention[];
  upcomingDeadlines: DashboardTask[];
  recentDocuments: DashboardDocument[];
  tax: DashboardTax;
  activeCases: Array<DashboardCase & { progress: number }>;
};
export interface DashboardRepository {
  getNeedsAttention(): Promise<DashboardAttention[]>;
  getUpcomingDeadlines(): Promise<DashboardTask[]>;
  getRecentDocuments(limit?: number): Promise<DashboardDocument[]>;
  getTaxSummary(year?: number): Promise<DashboardTax>;
  getActiveCases(): Promise<Array<DashboardCase & { progress: number }>>;
}

const day = 86_400_000;
const dateValue = (date: string) =>
  new Date(`${date.length === 10 ? `${date}T12:00:00Z` : date}`).getTime();

export class DashboardService {
  constructor(
    private readonly source: {
      documents: DashboardDocument[];
      tasks: DashboardTask[];
      tax: DashboardTax;
      cases: DashboardCase[];
    },
    private readonly now = new Date(),
  ) {}
  getNeedsAttention(): DashboardAttention[] {
    const now = this.now.getTime();
    const horizon = now + 7 * day;
    const attention: DashboardAttention[] = [];
    for (const task of this.source.tasks) {
      if (task.completed) continue;
      const date = dateValue(task.dueDate);
      if (date < now)
        attention.push({
          id: task.id,
          title: task.title,
          kind: 'overdue',
          date: task.dueDate,
          priority: 0,
        });
      else if (date <= horizon)
        attention.push({
          id: task.id,
          title: task.title,
          kind: 'due_soon',
          date: task.dueDate,
          priority: 1,
        });
    }
    for (const document of this.source.documents) {
      if (document.expiryDate) {
        const expiry = dateValue(document.expiryDate);
        if (expiry >= now && expiry <= horizon)
          attention.push({
            id: document.id,
            title: document.title,
            kind: 'expiry',
            date: document.expiryDate,
            priority: 2,
          });
      }
      if (document.requiresReview)
        attention.push({ id: document.id, title: document.title, kind: 'review', priority: 3 });
    }
    return attention.sort(
      (a, b) =>
        a.priority - b.priority ||
        dateValue(a.date ?? '9999-12-31') - dateValue(b.date ?? '9999-12-31'),
    );
  }
  getUpcomingDeadlines(): DashboardTask[] {
    const now = this.now.getTime();
    const end = now + 30 * day;
    return this.source.tasks
      .filter(
        (task) =>
          !task.completed && dateValue(task.dueDate) >= now && dateValue(task.dueDate) <= end,
      )
      .sort((a, b) => dateValue(a.dueDate) - dateValue(b.dueDate));
  }
  getRecentDocuments(): DashboardDocument[] {
    return [...this.source.documents]
      .sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt))
      .slice(0, 5);
  }
  getTaxSummary(): DashboardTax {
    return this.source.tax;
  }
  getActiveCases(): Array<DashboardCase & { progress: number }> {
    return this.source.cases
      .filter((item) => !['completed', 'archived'].includes(item.status))
      .map((item) => ({
        ...item,
        progress: item.totalItems ? Math.round((item.completedItems / item.totalItems) * 100) : 0,
      }));
  }
  getSummary(): DashboardSummary {
    return {
      needsAttention: this.getNeedsAttention(),
      upcomingDeadlines: this.getUpcomingDeadlines(),
      recentDocuments: this.getRecentDocuments(),
      tax: this.getTaxSummary(),
      activeCases: this.getActiveCases(),
    };
  }
}
