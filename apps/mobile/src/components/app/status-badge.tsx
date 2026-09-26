import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
};

const appearance = {
  neutral: {
    container: 'border-border bg-background',
    text: 'text-muted-foreground',
  },
  success: {
    container: 'border-success/25 bg-success/10',
    text: 'text-success',
  },
  warning: {
    container: 'border-warning/25 bg-warning/10',
    text: 'text-warning',
  },
  danger: {
    container: 'border-danger/25 bg-danger/10',
    text: 'text-danger',
  },
  info: {
    container: 'border-info/25 bg-info/10',
    text: 'text-info',
  },
} satisfies Record<StatusTone, { container: string; text: string }>;

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  const styles = appearance[tone];

  return (
    <Badge variant="outline" className={`self-start rounded-full px-sm py-xs ${styles.container}`}>
      <Text className={`font-manrope-medium text-xs ${styles.text}`}>{label}</Text>
    </Badge>
  );
}
