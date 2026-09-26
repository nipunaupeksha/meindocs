import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePreview } from '@/features/preview/provider';
import { validDate } from '@/features/preview/data';
import { Field, Options, Page } from '@/features/preview/ui';
import { readRouteId } from '@/lib/route-params';
export default function CreateReminderScreen() {
  const params = useLocalSearchParams<{ documentId?: string | string[] }>();
  const { t, language, documents, addTask } = usePreview();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-09-30');
  const [linked, setLinked] = useState(readRouteId(params.documentId) ?? 'none');
  const [priority, setPriority] = useState<'normal' | 'high'>('normal');
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const documentId = documents.find((item) => item.id === linked)?.id;
  function save() {
    if (!title.trim() || !validDate(date)) {
      setError(true);
      return;
    }
    setSaved(true);
    addTask({
      title: { en: title.trim(), de: title.trim() },
      date,
      priority,
      documentId,
    });
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/tasks');
  }
  return (
    <Page
      title={t('Let us remember for you.', 'Damit du an alles denkst.')}
      subtitle={t(
        'A small nudge for something important.',
        'Eine kleine Erinnerung an etwas Wichtiges.',
      )}
    >
      <Field
        label={t('What needs doing?', 'Was steht an?')}
        value={title}
        onChangeText={setTitle}
        placeholder={t('e.g. Review insurance renewal', 'z. B. Versicherungsverlängerung prüfen')}
        maxLength={120}
      />
      <Field
        label={t('Due date · YYYY-MM-DD', 'Fällig am · JJJJ-MM-TT')}
        value={date}
        onChangeText={setDate}
        placeholder="2026-09-30"
        autoCorrect={false}
        maxLength={10}
      />
      <Text className="font-manrope-semibold">{t('Priority', 'Priorität')}</Text>
      <Options
        value={priority}
        onChange={setPriority}
        options={[
          { value: 'normal', label: t('Normal', 'Normal') },
          { value: 'high', label: t('Important', 'Wichtig') },
        ]}
      />
      <Text className="font-manrope-semibold">{t('Linked document', 'Verknüpftes Dokument')}</Text>
      <Options
        value={linked}
        onChange={setLinked}
        options={[
          { value: 'none', label: t('None', 'Keines') },
          ...documents.map((item) => ({ value: item.id, label: item.title[language] })),
        ]}
      />
      {error && (
        <Text accessibilityRole="alert" className="text-danger">
          {t(
            'Enter a title and a valid date in YYYY-MM-DD format.',
            'Bitte einen Titel und ein gültiges Datum im Format JJJJ-MM-TT eingeben.',
          )}
        </Text>
      )}
      <Button disabled={saved} onPress={save}>
        <Text>{t('Save reminder', 'Erinnerung speichern')}</Text>
      </Button>
      <Text className="text-sm text-muted-foreground">
        {t(
          'Saved in this preview only. No system notification is scheduled.',
          'Wird nur in dieser Vorschau gespeichert. Es wird keine Systemmitteilung geplant.',
        )}
      </Text>
    </Page>
  );
}
