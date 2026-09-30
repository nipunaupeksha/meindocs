import type {
  DashboardAttention,
  DashboardCase,
  DashboardDocument,
  DashboardRepository,
  DashboardTask,
  DashboardTax,
} from '@meindocs/domain';
import { sql } from 'drizzle-orm';

type Db = ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>;
const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

export class SqliteDashboardRepository implements DashboardRepository {
  constructor(
    private readonly db: Db,
    private readonly clock = () => new Date(),
  ) {}
  async getNeedsAttention(): Promise<DashboardAttention[]> {
    const now = this.clock();
    const iso = now.toISOString();
    const soon = new Date(now.getTime() + 7 * 86_400_000).toISOString();
    const rows = await this.db.all(
      sql.raw(
        `SELECT r.id, r.title, r.due_date AS date, 'overdue' AS kind, 0 AS priority FROM reminders r WHERE r.completed = 0 AND date(r.due_date) < date(${quote(iso)}) UNION ALL SELECT r.id, r.title, r.due_date, 'due_soon', 1 FROM reminders r WHERE r.completed = 0 AND date(r.due_date) >= date(${quote(iso)}) AND date(r.due_date) <= date(${quote(soon)}) UNION ALL SELECT d.id, d.title, r.expiry_date, 'expiry', 2 FROM reminders r JOIN documents d ON d.id = r.document_id WHERE r.completed = 0 AND date(r.expiry_date) >= date(${quote(iso)}) AND date(r.expiry_date) <= date(${quote(soon)}) UNION ALL SELECT d.id, d.title, NULL, 'review', 3 FROM documents d WHERE d.status = 'needs_review' ORDER BY priority ASC, date ASC`,
      ),
    );
    return (rows as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      kind: row.kind as DashboardAttention['kind'],
      date: row.date ? String(row.date) : undefined,
      priority: Number(row.priority),
    }));
  }
  async getUpcomingDeadlines(): Promise<DashboardTask[]> {
    const now = this.clock();
    const end = new Date(now.getTime() + 30 * 86_400_000);
    const rows = await this.db.all(
      sql.raw(
        `SELECT id, title, due_date, document_id FROM reminders WHERE completed = 0 AND due_date >= ${quote(now.toISOString())} AND due_date <= ${quote(end.toISOString())} ORDER BY due_date ASC`,
      ),
    );
    return (rows as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      dueDate: String(row.due_date),
      completed: false,
      documentId: row.document_id ? String(row.document_id) : undefined,
    }));
  }
  async getRecentDocuments(limit = 5): Promise<DashboardDocument[]> {
    const rows = await this.db.all(
      sql.raw(
        `SELECT id, title, createdAt, status FROM documents ORDER BY createdAt DESC LIMIT ${Math.min(Math.max(limit, 1), 50)}`,
      ),
    );
    return (rows as Record<string, unknown>[]).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      createdAt: String(row.createdAt),
      requiresReview: row.status === 'needs_review',
    }));
  }
  async getTaxSummary(year = this.clock().getUTCFullYear()): Promise<DashboardTax> {
    const unreviewed = await this.db.all(
      sql.raw(
        `SELECT COUNT(*) AS count FROM tax_metadata t JOIN documents d ON d.id = t.document_id WHERE t.tax_year = ${year} AND d.status = 'needs_review'`,
      ),
    );
    const rows = await this.db.all(
      sql.raw(
        `SELECT COALESCE(SUM(CASE WHEN t.tax_relevant = 1 THEN COALESCE(t.gross_amount, 0) ELSE 0 END), 0) AS expenses FROM tax_metadata t JOIN documents d ON d.id = t.document_id WHERE t.tax_year = ${year} AND d.type = 'receipt'`,
      ),
    );
    return {
      year,
      unreviewedReceipts: Number(
        (unreviewed[0] as Record<string, unknown> | undefined)?.count ?? 0,
      ),
      trackedBusinessExpenses: Number(
        (rows[0] as Record<string, unknown> | undefined)?.expenses ?? 0,
      ),
    };
  }
  async getActiveCases(): Promise<Array<DashboardCase & { progress: number }>> {
    const rows = await this.db.all(
      sql.raw(
        `SELECT c.id, c.title, c.status, COUNT(i.id) AS total_items, COALESCE(SUM(CASE WHEN i.completed = 1 THEN 1 ELSE 0 END), 0) AS completed_items FROM cases c LEFT JOIN case_checklist_items i ON i.case_id = c.id WHERE c.status NOT IN ('completed', 'archived') GROUP BY c.id ORDER BY c.updatedAt DESC`,
      ),
    );
    return (rows as Record<string, unknown>[]).map((row) => {
      const total = Number(row.total_items);
      const completed = Number(row.completed_items);
      return {
        id: String(row.id),
        title: String(row.title),
        status: String(row.status),
        totalItems: total,
        completedItems: completed,
        progress: total ? Math.round((completed / total) * 100) : 0,
      };
    });
  }
}
