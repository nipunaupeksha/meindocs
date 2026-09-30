type ReminderState = 'completed' | 'overdue' | 'upcoming';

export function reminderState(
  reminder: {
    dueDate: string;
    expiryDate?: string;
    completed: boolean;
  },
  today = new Date(),
) {
  if (reminder.completed) return 'completed' satisfies ReminderState;
  const endDate = reminder.expiryDate ?? reminder.dueDate;
  const deadline = new Date(`${endDate}T23:59:59`);
  return deadline.getTime() < today.getTime() ? 'overdue' : 'upcoming';
}
