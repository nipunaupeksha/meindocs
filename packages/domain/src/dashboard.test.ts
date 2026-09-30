import { expect, test } from 'bun:test';
import { DashboardService } from './dashboard';

test('needs attention prioritizes overdue, due soon, expiry, then review', () => {
  const service = new DashboardService(
    {
      documents: [
        {
          id: 'expiry',
          title: 'Insurance',
          createdAt: '2026-09-01',
          requiresReview: false,
          expiryDate: '2026-09-25',
        },
        { id: 'review', title: 'Receipt', createdAt: '2026-09-01', requiresReview: true },
      ],
      tasks: [
        { id: 'due', title: 'Pay bill', dueDate: '2026-09-23', completed: false },
        { id: 'overdue', title: 'Submit form', dueDate: '2026-09-10', completed: false },
      ],
      tax: { year: 2026, unreviewedReceipts: 1, trackedBusinessExpenses: 10 },
      cases: [],
    },
    new Date('2026-09-22T12:00:00Z'),
  );
  expect(service.getNeedsAttention().map((item) => item.kind)).toEqual([
    'overdue',
    'due_soon',
    'expiry',
    'review',
  ]);
});

test('dashboard summaries return upcoming, recent, tax, and active case data', () => {
  const service = new DashboardService(
    {
      documents: [{ id: 'doc', title: 'Recent', createdAt: '2026-09-22', requiresReview: false }],
      tasks: [{ id: 'task', title: 'Deadline', dueDate: '2026-09-30', completed: false }],
      tax: { year: 2026, unreviewedReceipts: 2, trackedBusinessExpenses: 120 },
      cases: [{ id: 'case', title: 'Tax', status: 'open', completedItems: 1, totalItems: 2 }],
    },
    new Date('2026-09-22T12:00:00Z'),
  );
  const summary = service.getSummary();
  expect(summary.upcomingDeadlines).toHaveLength(1);
  expect(summary.recentDocuments[0]?.id).toBe('doc');
  expect(summary.tax.trackedBusinessExpenses).toBe(120);
  expect(summary.activeCases[0]?.progress).toBe(50);
});
