import { DocumentRow } from '@/components/app/document-row';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, typography } from '@meindocs/ui';
import type { ComponentProps, PropsWithChildren } from 'react';
import { Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '@/components/app/app-header';
import { Screen } from '@/components/app/screen';
import { Card } from '@/components/app/card';
import { Text } from '@/components/ui/text';
import { StatusBadge } from '@/components/app/status-badge';
import { cn } from '@/lib/utils';
import { usePreview } from './provider';
import { categories, formatDate, type MockDocument, type MockTask } from './data';

type IconName = ComponentProps<typeof Ionicons>['name'];
export function Icon({
  name,
  color = colors.primary,
  size = 22,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
export function Page({
  children,
  title,
  subtitle,
  tab = false,
}: PropsWithChildren<{ title?: string; subtitle?: string; tab?: boolean }>) {
  return (
    <Screen scroll edges={tab ? ['top', 'left', 'right'] : ['left', 'right', 'bottom']}>
      {title ? <AppHeader title={title} subtitle={subtitle} /> : null}
      {children}
      <PreviewNote />
    </Screen>
  );
}
function PreviewNote() {
  const { t } = usePreview();
  return (
    <Text className="text-center text-xs text-muted-foreground">
      {t(
        'Interactive preview · sample data · changes reset on reload',
        'Interaktive Vorschau · Beispieldaten · Änderungen gelten bis zum Neuladen',
      )}
    </Text>
  );
}
export function Metric({ label, value, icon }: { label: string; value: string; icon: IconName }) {
  return (
    <Card className="min-w-0 flex-1 gap-sm">
      <Icon name={icon} />
      <Text className="font-manrope-bold text-2xl">{value}</Text>
      <Text className="text-sm text-muted-foreground">{label}</Text>
    </Card>
  );
}
export function Options<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="flex-row gap-sm">
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === option.value }}
            onPress={() => onChange(option.value)}
            className={cn(
              'min-h-12 justify-center rounded-full border border-border px-md py-sm',
              value === option.value ? 'bg-primary border-primary' : 'bg-surface',
            )}
          >
            <Text
              className={cn('font-manrope-medium text-sm', value === option.value && 'text-white')}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
export function Field({ label, ...props }: ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View className="gap-sm">
      <Text className="font-manrope-medium text-sm">{label}</Text>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[
          {
            minHeight: 52,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 14,
            color: colors.text,
            backgroundColor: colors.surface,
            fontFamily: typography.fontFamily.regular,
            fontSize: 16,
          },
          props.style,
        ]}
      />
    </View>
  );
}
export function SettingToggle({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center gap-md py-sm">
      <View className="flex-1 gap-xs">
        <Text className="font-manrope-medium">{title}</Text>
        <Text className="text-sm text-muted-foreground">{description}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
      />
    </View>
  );
}
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row flex-wrap justify-between gap-sm border-b border-border py-sm">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="font-manrope-medium text-sm">{value}</Text>
    </View>
  );
}
export function DocumentItem({ document }: { document: MockDocument }) {
  const { language, t } = usePreview();
  return (
    <DocumentRow
      title={document.title[language]}
      metadata={`${categories[document.category][language]} · ${formatDate(document.date, language)} · ${document.size}`}
      thumbnail={<Icon name={document.favorite ? 'star-outline' : 'document-text-outline'} />}
      status={{
        label: document.reviewed ? t('Reviewed', 'Geprüft') : t('Needs review', 'Zu prüfen'),
        tone: document.reviewed ? 'success' : 'warning',
      }}
      onPress={() => router.push({ pathname: '/document/[id]', params: { id: document.id } })}
    />
  );
}

export function TaskItem({ task }: { task: MockTask }) {
  const { language, toggleTask } = usePreview();
  return (
    <Card>
      <View className="flex-row items-center gap-md">
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.done }}
          accessibilityLabel={task.title[language]}
          onPress={() => toggleTask(task.id)}
          className="h-12 w-12 items-center justify-center"
        >
          <Icon
            name={task.done ? 'checkmark-circle' : 'ellipse-outline'}
            color={task.done ? colors.success : colors.muted}
            size={28}
          />
        </Pressable>
        <View className="flex-1 gap-xs">
          <Text
            className={cn('font-manrope-medium', task.done && 'line-through text-muted-foreground')}
          >
            {task.title[language]}
          </Text>
          <Text className="text-xs text-muted-foreground">{formatDate(task.date, language)}</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between gap-sm">
        <TaskPriority priority={task.priority} />
        <TaskDocumentLink documentId={task.documentId} />
      </View>
    </Card>
  );
}
function TaskPriority({ priority }: { priority: MockTask['priority'] }) {
  const { t } = usePreview();
  return (
    <StatusBadge
      label={priority === 'high' ? t('Priority', 'Wichtig') : t('Reminder', 'Erinnerung')}
      tone={priority === 'high' ? 'warning' : 'neutral'}
    />
  );
}
function TaskDocumentLink({ documentId }: { documentId?: string }) {
  const { t } = usePreview();
  if (!documentId) return null;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/document/[id]', params: { id: documentId } })}
      className="min-h-12 justify-center"
    >
      <Text className="text-sm text-primary">{t('View document', 'Dokument öffnen')} →</Text>
    </Pressable>
  );
}
export function ActionTile({
  title,
  description,
  icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: IconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-md rounded-lg border border-border bg-surface p-md active:bg-primary-soft"
    >
      <View className="h-12 w-12 items-center justify-center rounded-lg bg-primary-soft">
        <Icon name={icon} />
      </View>
      <View className="flex-1 gap-xs">
        <Text className="font-manrope-semibold">{title}</Text>
        <Text className="text-sm text-muted-foreground">{description}</Text>
      </View>
      <Icon name="chevron-forward" size={18} />
    </Pressable>
  );
}
