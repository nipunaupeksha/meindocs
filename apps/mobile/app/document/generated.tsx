import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { Page } from '@/features/preview/ui';
import { useDocumentGeneratorStore } from '@/features/document-generator/store';

export default function GeneratedDocumentScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const document = useDocumentGeneratorStore((state) =>
    state.generated.find((item) => item.id === id),
  );
  if (!document)
    return (
      <Page>
        <Text>Generated document not found.</Text>
      </Page>
    );
  return (
    <Page title={document.title}>
      <Card>
        <Text>{document.content}</Text>
      </Card>
      <Text className="text-sm text-muted-foreground">TXT: {document.storageUri}</Text>
      <Text className="text-sm text-muted-foreground">PDF: {document.pdfUri}</Text>
      <Button onPress={() => router.back()}>
        <Text>Done</Text>
      </Button>
    </Page>
  );
}
