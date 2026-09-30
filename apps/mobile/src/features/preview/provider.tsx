import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@meindocs/ui';
import { DashboardService } from '@meindocs/domain';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { AccessibilityInfo, Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import {
  initialCases,
  initialOrganisations,
  initialPeople,
  type Language,
  type MockCase,
  type MockDocument,
  type MockTask,
  type MockPerson,
  type MockOrganisation,
  type StorageId,
} from './data';
import { createPreviewRepositories } from './repositories';
import type { LocalFileRecord } from '@/features/files/local-file-service';
import type { DocumentDraft } from '@/features/files/processing-pipeline';
import {
  cancelReminderNotification,
  scheduleReminderNotification,
} from '@/features/reminders/notifications';

// fallow-ignore-next-line complexity
function previewDocumentFromFile(file: LocalFileRecord, draft?: DocumentDraft) {
  return {
    id: file.id,
    title: { en: draft?.title ?? file.originalName, de: draft?.title ?? file.originalName },
    issuer: 'MeinDocs',
    category: 'home' as const,
    date: file.importedAt.slice(0, 10),
    pages: 2,
    size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    favorite: false,
    reviewed: false,
    localUri: file.localUri,
    thumbnailUri: file.thumbnailUri,
    sha256: file.sha256,
    extractedText: draft?.extractedText,
    ocrStatus: draft?.ocrStatus,
    amount: draft?.analysis?.taxSuggestion?.grossAmount,
    tax: draft?.analysis?.taxSuggestion,
  };
}

function samplePreviewDocument(id: string) {
  return {
    id,
    title: { en: 'New scanned document', de: 'Neu gescanntes Dokument' },
    issuer: 'MeinDocs',
    category: 'home' as const,
    date: '2026-09-22',
    pages: 2,
    size: '640 KB',
    favorite: false,
    reviewed: false,
  };
}

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
  const [cases, setCases] = useState<MockCase[]>(initialCases);
  const [people, setPeople] = useState<MockPerson[]>(initialPeople);
  const [organisations, setOrganisations] = useState<MockOrganisation[]>(initialOrganisations);
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
    if (!task.done) await cancelReminderNotification(task.notificationId);
    await repositories.reminderRepository.update(id, { done: !task.done });
    setTasks(await repositories.reminderRepository.list());
    notify('Task updated', 'Aufgabe aktualisiert');
  }
  async function addTask(task: Omit<MockTask, 'id' | 'done'>) {
    const created = await repositories.reminderRepository.create({
      ...task,
      id: `task-${++sequence.current}`,
    });
    const notificationId = settings.reminders
      ? await scheduleReminderNotification({
          title: created.title.en,
          dueDate: created.date,
          expiryDate: created.expiryDate,
        })
      : null;
    if (notificationId) {
      await repositories.reminderRepository.update(created.id, { notificationId });
    }
    setTasks(await repositories.reminderRepository.list());
    notify('Reminder created in preview', 'Erinnerung in der Vorschau erstellt');
  }
  async function addDocument(file?: LocalFileRecord, draft?: DocumentDraft) {
    if (file && (await repositories.documentRepository.getById(file.id))) return file.id;
    const id = `scan-${++sequence.current}`;
    await repositories.documentRepository.create(
      file ? previewDocumentFromFile(file, draft) : samplePreviewDocument(id),
    );
    setDocuments(await repositories.documentRepository.list());
    notify('Document added to preview', 'Dokument zur Vorschau hinzugefügt');
    return id;
  }
  function createCase(input: Pick<MockCase, 'title' | 'type' | 'deadline'>) {
    const created: MockCase = {
      ...input,
      id: `case-${++sequence.current}`,
      status: 'open',
      documentIds: [],
      checklist: [],
      people: [],
      organisations: [],
      timeline: [
        {
          id: `event-${sequence.current}`,
          label: 'Case created',
          date: new Date().toISOString().slice(0, 10),
        },
      ],
    };
    setCases((items) => [created, ...items]);
    notify('Case created', 'Fall erstellt');
    return created.id;
  }
  function addDocumentToCase(caseId: string, documentId: string) {
    setCases((items) =>
      items.map((item) =>
        item.id === caseId && !item.documentIds.includes(documentId)
          ? {
              ...item,
              documentIds: [...item.documentIds, documentId],
              timeline: [
                ...item.timeline,
                {
                  id: `event-${++sequence.current}`,
                  label: 'Document added',
                  date: new Date().toISOString().slice(0, 10),
                },
              ],
            }
          : item,
      ),
    );
    notify('Document added to case', 'Dokument zum Fall hinzugefügt');
  }
  function toggleCaseChecklist(caseId: string, itemId: string) {
    setCases((items) =>
      items.map((item) =>
        item.id !== caseId
          ? item
          : {
              ...item,
              checklist: item.checklist.map((check) =>
                check.id === itemId ? { ...check, completed: !check.completed } : check,
              ),
            },
      ),
    );
  }
  function updateCase(
    caseId: string,
    patch: Partial<Pick<MockCase, 'title' | 'status' | 'deadline'>>,
  ) {
    setCases((items) => items.map((item) => (item.id === caseId ? { ...item, ...patch } : item)));
    notify('Case updated', 'Fall aktualisiert');
  }
  const dashboard = useMemo(
    () =>
      new DashboardService({
        documents: documents.map((document) => ({
          id: document.id,
          title: document.title.en,
          createdAt: document.date,
          requiresReview: !document.reviewed,
          expiryDate: tasks.find((task) => task.documentId === document.id)?.expiryDate,
          isReceipt: document.category === 'tax',
          businessExpense: document.category === 'tax' ? document.amount : undefined,
        })),
        tasks: tasks.map((task) => ({
          id: task.id,
          title: task.title.en,
          dueDate: task.date,
          completed: task.done,
          documentId: task.documentId,
        })),
        tax: {
          year: new Date().getUTCFullYear(),
          unreviewedReceipts: documents.filter(
            (document) => document.category === 'tax' && !document.reviewed,
          ).length,
          trackedBusinessExpenses: documents
            .filter((document) => document.category === 'tax')
            .reduce((total, document) => total + (document.amount ?? 0), 0),
        },
        cases: cases.map((item) => ({
          id: item.id,
          title: item.title,
          status: item.status,
          completedItems: item.checklist.filter((check) => check.completed).length,
          totalItems: item.checklist.length,
        })),
      }),
    [documents, tasks, cases],
  );
  function createPerson(input: Omit<MockPerson, 'id' | 'documentIds' | 'caseIds'>) {
    const item = { ...input, id: `person-${++sequence.current}`, documentIds: [], caseIds: [] };
    setPeople((items) => [item, ...items]);
    notify('Person created', 'Person erstellt');
    return item.id;
  }
  function updatePerson(personId: string, patch: Partial<MockPerson>) {
    setPeople((items) =>
      items.map((item) => (item.id === personId ? { ...item, ...patch } : item)),
    );
    notify('Person updated', 'Person aktualisiert');
  }
  function createOrganisation(
    input: Omit<MockOrganisation, 'id' | 'documentIds' | 'caseIds' | 'paymentIds' | 'actionIds'>,
  ) {
    const item = {
      ...input,
      id: `organisation-${++sequence.current}`,
      documentIds: [],
      caseIds: [],
      paymentIds: [],
      actionIds: [],
    };
    setOrganisations((items) => [item, ...items]);
    notify('Organisation created', 'Organisation erstellt');
    return item.id;
  }
  function updateOrganisation(organisationId: string, patch: Partial<MockOrganisation>) {
    setOrganisations((items) =>
      items.map((item) => (item.id === organisationId ? { ...item, ...patch } : item)),
    );
    notify('Organisation updated', 'Organisation aktualisiert');
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
    cases,
    createCase,
    addDocumentToCase,
    toggleCaseChecklist,
    updateCase,
    people,
    organisations,
    createPerson,
    updatePerson,
    createOrganisation,
    updateOrganisation,
    tasks,
    dashboard,
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
