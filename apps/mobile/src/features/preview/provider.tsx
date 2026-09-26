import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@meindocs/ui';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { AccessibilityInfo, Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { type Language, type MockDocument, type MockTask, type StorageId } from './data';
import { createPreviewRepositories } from './repositories';

function usePreviewState() {
  const [language, setLanguage] = useState<Language>('en');
  const [toasts, setToasts] = useState(true);
  const [settings, setSettings] = useState({
    reminders: true,
    wifi: true,
    biometric: false,
    storage: 'local' as StorageId,
  });
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [folders, setFolders] = useState<Record<StorageId, string>>({
    local: 'Documents/MeinDocs',
    icloud: 'MeinDocs',
    google: 'MeinDocs',
    onedrive: 'Documents/MeinDocs',
  });
  const [repositories] = useState(createPreviewRepositories);
  const [documents, setDocuments] = useState<MockDocument[]>([]);
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [toast, setToast] = useState<{ id: number; title: string } | null>(null);
  const sequence = useRef(0);
  const t = (en: string, de: string) => (language === 'de' ? de : en);
  useEffect(() => {
    void Promise.all([
      repositories.documentRepository.list(),
      repositories.reminderRepository.list(),
    ]).then(([loadedDocuments, loadedTasks]) => {
      setDocuments(loadedDocuments);
      setTasks(loadedTasks);
    });
  }, [repositories]);
  function notify(en: string, de: string) {
    if (toasts) setToast({ id: ++sequence.current, title: t(en, de) });
  }
  function changeLanguage(value: Language) {
    setLanguage(value);
    if (toasts)
      setToast({
        id: ++sequence.current,
        title: value === 'de' ? 'Sprache auf Deutsch geändert' : 'Language changed to English',
      });
  }
  function changeToasts(value: boolean) {
    setToasts(value);
    setToast(
      value
        ? {
            id: ++sequence.current,
            title: t('Pop-up notifications enabled', 'Pop-up-Mitteilungen aktiviert'),
          }
        : null,
    );
  }
  async function updateDocument(
    id: string,
    patch: Partial<Pick<MockDocument, 'favorite' | 'reviewed' | 'category'>>,
  ) {
    await repositories.documentRepository.update(id, patch);
    setDocuments(await repositories.documentRepository.list());
    notify('Document updated', 'Dokument aktualisiert');
  }
  async function toggleTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    await repositories.reminderRepository.update(id, { done: !task.done });
    setTasks(await repositories.reminderRepository.list());
    notify('Task updated', 'Aufgabe aktualisiert');
  }
  async function addTask(task: Omit<MockTask, 'id' | 'done'>) {
    await repositories.reminderRepository.create({ ...task, id: `task-${++sequence.current}` });
    setTasks(await repositories.reminderRepository.list());
    notify('Reminder created in preview', 'Erinnerung in der Vorschau erstellt');
  }
  async function addDocument() {
    const id = `scan-${++sequence.current}`;
    await repositories.documentRepository.create({
      id,
      title: { en: 'New scanned document', de: 'Neu gescanntes Dokument' },
      issuer: 'MeinDocs',
      category: 'home',
      date: '2026-09-22',
      pages: 2,
      size: '640 KB',
      favorite: false,
      reviewed: false,
    });
    setDocuments(await repositories.documentRepository.list());
    notify('Document added to preview', 'Dokument zur Vorschau hinzugefügt');
    return id;
  }
  return {
    language,
    t,
    changeLanguage,
    toasts,
    changeToasts,
    settings,
    setSettings,
    connections,
    setConnections,
    folders,
    setFolders,
    documents,
    tasks,
    updateDocument,
    toggleTask,
    addTask,
    addDocument,
    notify,
    toast,
    dismissToast: () => setToast(null),
  };
}
const PreviewContext = createContext<ReturnType<typeof usePreviewState> | null>(null);
export function usePreview() {
  const value = useContext(PreviewContext);
  if (!value) throw new Error('PreviewProvider is required');
  return value;
}
export function PreviewProvider({ children }: PropsWithChildren) {
  const value = usePreviewState();
  return (
    <PreviewContext.Provider value={value}>
      {children}
      <ToastHost />
    </PreviewContext.Provider>
  );
}
function ToastHost() {
  const { toast, dismissToast, t } = usePreview();
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const dismissRef = useRef(dismissToast);
  dismissRef.current = dismissToast;
  useEffect(() => {
    if (!toast) return;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    AccessibilityInfo.announceForAccessibility(toast.title);
    const timer = setTimeout(() => dismissRef.current(), 4500);
    return () => {
      clearTimeout(timer);
      progress.stopAnimation();
    };
  }, [toast, progress]);
  if (!toast) return null;
  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 16,
        right: 16,
        zIndex: 1000,
        opacity: progress,
        transform: [
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) },
        ],
      }}
    >
      <View className="flex-row items-center gap-sm rounded-lg border border-border bg-surface p-md shadow-lg">
        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        <Text accessibilityLiveRegion="polite" className="flex-1 font-manrope-medium text-sm">
          {toast.title}
        </Text>
        <Pressable
          onPress={dismissToast}
          accessibilityRole="button"
          accessibilityLabel={t('Dismiss notification', 'Mitteilung schließen')}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="close" size={20} color={colors.muted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}
