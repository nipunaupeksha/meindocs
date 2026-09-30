import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { Field, Options, Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
import { mobileDocumentGenerator } from '@/features/document-generator/service';
import { useDocumentGeneratorStore } from '@/features/document-generator/store';

export default function GenerateDocumentScreen() {
  const { t, documents, cases } = usePreview();
  const { documentId, caseId } = useLocalSearchParams<{
    documentId?: string | string[];
    caseId?: string | string[];
  }>();
  const sourceDocumentId = Array.isArray(documentId) ? documentId[0] : documentId;
  const sourceCaseId = Array.isArray(caseId) ? caseId[0] : caseId;
  const templates = mobileDocumentGenerator.listTemplates();
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const [language, setLanguage] = useState<'de' | 'en'>('de');
  const [person, setPerson] = useState('');
  const [organisation, setOrganisation] = useState(
    documents.find((item) => item.id === sourceDocumentId)?.issuer ?? '',
  );
  const [values, setValues] = useState<Record<string, string>>({
    senderName: 'MeinDocs User',
    date: new Date().toISOString().slice(0, 10),
    recipientName: organisation,
  });
  const [preview, setPreview] = useState('');
  const template = useMemo(
    () => mobileDocumentGenerator.listTemplates().find((item) => item.id === templateId),
    [templateId],
  );
  const { add } = useDocumentGeneratorStore();
  function update(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }
  function renderPreview() {
    setPreview(
      mobileDocumentGenerator.render(templateId, language, {
        ...values,
        recipientName: person || values.recipientName || organisation,
      }).content,
    );
  }
  return (
    <Page
      title={t('Generate a document', 'Dokument erstellen')}
      subtitle={t(
        'Start from a formal template and review every field before saving.',
        'Vorlage wählen, Felder prüfen und lokal speichern.',
      )}
    >
      <Options
        value={templateId}
        onChange={setTemplateId}
        options={templates.map((item) => ({ value: item.id, label: item.title[language] }))}
      />
      <Options
        value={language}
        onChange={setLanguage}
        options={[
          { value: 'de', label: 'Deutsch' },
          { value: 'en', label: 'English' },
        ]}
      />
      <Options
        value={person}
        onChange={setPerson}
        options={[
          { value: '', label: t('No person selected', 'Keine Person') },
          ...documents.slice(0, 4).map((item) => ({ value: item.issuer, label: item.issuer })),
        ]}
      />
      <Options
        value={organisation}
        onChange={setOrganisation}
        options={[
          { value: '', label: t('No organisation selected', 'Keine Organisation') },
          ...documents.slice(0, 4).map((item) => ({ value: item.issuer, label: item.issuer })),
        ]}
      />
      {template?.fields.map((field) => (
        <Field
          key={field.key}
          label={`${field.label[language]}${field.required ? ' *' : ''}`}
          value={values[field.key] ?? ''}
          onChangeText={(value) => update(field.key, value)}
          multiline={field.kind === 'multiline' || field.kind === 'address'}
          placeholder={field.label[language]}
        />
      ))}
      {sourceCaseId && (
        <Text className="text-sm text-muted-foreground">
          {t('Linked case', 'Verknüpfter Fall')}:{' '}
          {cases.find((item) => item.id === sourceCaseId)?.title ?? sourceCaseId}
        </Text>
      )}
      <Button variant="secondary" onPress={renderPreview}>
        <Text>{t('Preview', 'Vorschau')}</Text>
      </Button>
      {preview ? (
        <Card>
          <Text className="font-manrope-medium">{t('Preview', 'Vorschau')}</Text>
          <Text>{preview}</Text>
          <Button
            onPress={async () => {
              const generated = await mobileDocumentGenerator.generate({
                templateId,
                language,
                values: {
                  ...values,
                  recipientName: person || values.recipientName || organisation,
                },
                sourceDocumentIds: sourceDocumentId ? [sourceDocumentId] : [],
                sourceCaseId,
              });
              add(generated);
              router.replace({ pathname: '/document/generated', params: { id: generated.id } });
            }}
          >
            <Text>{t('Save text and PDF locally', 'Text und PDF lokal speichern')}</Text>
          </Button>
        </Card>
      ) : null}
    </Page>
  );
}
