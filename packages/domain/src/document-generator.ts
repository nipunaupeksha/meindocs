export type TemplateLanguage = 'de' | 'en';
export type TemplateFieldKind = 'text' | 'date' | 'email' | 'address' | 'multiline';

export interface TemplateField {
  key: string;
  label: { de: string; en: string };
  kind: TemplateFieldKind;
  required?: boolean;
}

export interface DocumentTemplate {
  id: string;
  title: { de: string; en: string };
  description: { de: string; en: string };
  fields: TemplateField[];
  render: (language: TemplateLanguage, values: Record<string, string>) => string;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  content: string;
  mimeType: 'text/plain' | 'application/pdf';
  createdAt: string;
  generatedFromTemplate: string;
  sourceDocumentIds: string[];
  sourceCaseId?: string;
  storageUri?: string;
  pdfUri?: string;
}

const commonFields: TemplateField[] = [
  { key: 'senderName', label: { de: 'Absender', en: 'Sender' }, kind: 'text', required: true },
  { key: 'senderAddress', label: { de: 'Absenderadresse', en: 'Sender address' }, kind: 'address' },
  {
    key: 'recipientName',
    label: { de: 'Empfänger', en: 'Recipient' },
    kind: 'text',
    required: true,
  },
  {
    key: 'recipientAddress',
    label: { de: 'Empfängeradresse', en: 'Recipient address' },
    kind: 'address',
  },
  { key: 'date', label: { de: 'Datum', en: 'Date' }, kind: 'date', required: true },
];

const subjects: Record<string, { de: string; en: string }> = {
  'rental-termination': { de: 'Kündigung des Mietverhältnisses', en: 'Rental termination' },
  'repair-request': { de: 'Aufforderung zur Reparatur', en: 'Repair request' },
  'deposit-return': {
    de: 'Aufforderung zur Rückzahlung der Mietkaution',
    en: 'Rental deposit return request',
  },
  'insurance-cancellation': {
    de: 'Kündigung des Versicherungsvertrags',
    en: 'Insurance cancellation',
  },
  'employment-resignation': {
    de: 'Kündigung des Arbeitsverhältnisses',
    en: 'Employment resignation',
  },
  arbeitszeugnis: {
    de: 'Anforderung eines Arbeitszeugnisses',
    en: 'Request for an employment reference',
  },
  'finanzamt-response': { de: 'Antwort an das Finanzamt', en: 'Response to the tax office' },
  'payment-extension': { de: 'Antrag auf Zahlungsaufschub', en: 'Payment extension request' },
  'invoice-dispute': { de: 'Widerspruch gegen eine Rechnung', en: 'Invoice dispute' },
  'address-change': {
    de: 'Mitteilung über eine Adressänderung',
    en: 'Address change notification',
  },
  'document-submission': {
    de: 'Übersendung von Unterlagen',
    en: 'Document submission cover letter',
  },
  'immigration-inquiry': { de: 'Anfrage zum Aufenthaltsstatus', en: 'Immigration status inquiry' },
  'correction-request': { de: 'Antrag auf Korrektur', en: 'Request for correction' },
  vollmacht: { de: 'Vollmacht', en: 'Authorization letter' },
};

const body: Record<string, { de: string; en: string }> = {
  'rental-termination': {
    de: 'hiermit kündige ich das Mietverhältnis für {{propertyAddress}} fristgerecht zum {{terminationDate}}.',
    en: 'I hereby terminate the rental agreement for {{propertyAddress}} effective {{terminationDate}}.',
  },
  'repair-request': {
    de: 'hiermit bitte ich Sie, folgenden Mangel unverzüglich zu beheben: {{issueDescription}}.',
    en: 'I request that you remedy the following issue without delay: {{issueDescription}}.',
  },
  'deposit-return': {
    de: 'bitte zahlen Sie die Mietkaution in Höhe von {{amount}} bis zum {{paymentDeadline}} zurück.',
    en: 'Please return the rental deposit of {{amount}} by {{paymentDeadline}}.',
  },
  'insurance-cancellation': {
    de: 'hiermit kündige ich den Versicherungsvertrag mit der Nummer {{policyNumber}} zum {{terminationDate}}.',
    en: 'I hereby cancel policy {{policyNumber}} effective {{terminationDate}}.',
  },
  'employment-resignation': {
    de: 'hiermit kündige ich mein Arbeitsverhältnis zum {{terminationDate}}. Bitte bestätigen Sie mir den Beendigungszeitpunkt schriftlich.',
    en: 'I hereby resign from my employment effective {{terminationDate}}. Please confirm the end date in writing.',
  },
  arbeitszeugnis: {
    de: 'bitte stellen Sie mir ein qualifiziertes Arbeitszeugnis für meine Tätigkeit als {{jobTitle}} aus.',
    en: 'Please provide me with a qualified employment reference for my role as {{jobTitle}}.',
  },
  'finanzamt-response': {
    de: 'zu Ihrem Schreiben vom {{referenceDate}} nehme ich wie folgt Stellung:\n{{responseText}}',
    en: 'With regard to your letter dated {{referenceDate}}, I respond as follows:\n{{responseText}}',
  },
  'payment-extension': {
    de: 'ich bitte um eine Verlängerung der Zahlungsfrist für {{invoiceNumber}} bis zum {{paymentDeadline}}. Begründung: {{reason}}',
    en: 'I request an extension of the payment deadline for {{invoiceNumber}} until {{paymentDeadline}}. Reason: {{reason}}',
  },
  'invoice-dispute': {
    de: 'der Rechnung {{invoiceNumber}} vom {{invoiceDate}} widerspreche ich aus folgendem Grund:\n{{reason}}',
    en: 'I dispute invoice {{invoiceNumber}} dated {{invoiceDate}} for the following reason:\n{{reason}}',
  },
  'address-change': {
    de: 'meine neue Anschrift lautet:\n{{newAddress}}\nBitte aktualisieren Sie Ihre Unterlagen.',
    en: 'My new address is:\n{{newAddress}}\nPlease update your records.',
  },
  'document-submission': {
    de: 'anbei übersende ich Ihnen folgende Unterlagen:\n{{documentList}}',
    en: 'Please find the following documents enclosed:\n{{documentList}}',
  },
  'immigration-inquiry': {
    de: 'ich bitte um Auskunft zum Bearbeitungsstand meines Aufenthaltsverfahrens. Aktenzeichen: {{referenceNumber}}.',
    en: 'I kindly request an update on my immigration application. Reference: {{referenceNumber}}.',
  },
  'correction-request': {
    de: 'bitte korrigieren Sie folgende Angabe in Ihren Unterlagen:\n{{correctionDetails}}',
    en: 'Please correct the following information in your records:\n{{correctionDetails}}',
  },
  vollmacht: {
    de: 'hiermit bevollmächtige ich {{authorizedPerson}} mich in folgender Angelegenheit zu vertreten:\n{{scope}}',
    en: 'I hereby authorize {{authorizedPerson}} to represent me in the following matter:\n{{scope}}',
  },
};

const extraFields: Record<string, TemplateField[]> = {
  'rental-termination': [
    {
      key: 'propertyAddress',
      label: { de: 'Mietobjekt', en: 'Property address' },
      kind: 'address',
      required: true,
    },
    {
      key: 'terminationDate',
      label: { de: 'Kündigungstermin', en: 'Termination date' },
      kind: 'date',
      required: true,
    },
  ],
  'repair-request': [
    {
      key: 'issueDescription',
      label: { de: 'Mangel', en: 'Issue description' },
      kind: 'multiline',
      required: true,
    },
  ],
  'deposit-return': [
    {
      key: 'amount',
      label: { de: 'Kautionsbetrag', en: 'Deposit amount' },
      kind: 'text',
      required: true,
    },
    {
      key: 'paymentDeadline',
      label: { de: 'Rückzahlungsfrist', en: 'Payment deadline' },
      kind: 'date',
    },
  ],
};

export const documentTemplates: DocumentTemplate[] = Object.keys(subjects).map((id) => ({
  id,
  title: subjects[id],
  description: subjects[id],
  fields: [
    ...commonFields,
    ...(extraFields[id] ?? [
      { key: 'bodyDetails', label: { de: 'Details', en: 'Details' }, kind: 'multiline' },
    ]),
  ],
  render: (language, values) => {
    const replace = (value: string) =>
      value.replace(
        /{{(.*?)}}/g,
        (_, key: string) => values[key.trim()]?.trim() || `[${key.trim()}]`,
      );
    const greeting = language === 'de' ? 'Sehr geehrte Damen und Herren,' : 'Dear Sir or Madam,';
    const closing = language === 'de' ? 'Mit freundlichen Grüßen' : 'Yours faithfully';
    return `${values.senderName || '[senderName]'}\n${values.senderAddress || '[senderAddress]'}\n\n${values.recipientName || '[recipientName]'}\n${values.recipientAddress || '[recipientAddress]'}\n\n${values.date || '[date]'}\n\n${subjects[id][language]}\n\n${greeting}\n\n${replace(body[id][language])}\n\n${closing}\n${values.senderName || '[senderName]'}`;
  },
}));

export class DocumentGeneratorService {
  constructor(private readonly templates: DocumentTemplate[] = documentTemplates) {}
  getTemplates() {
    return this.templates;
  }
  getTemplate(id: string) {
    return this.templates.find((template) => template.id === id) ?? null;
  }
  render(templateId: string, language: TemplateLanguage, values: Record<string, string>) {
    const template = this.getTemplate(templateId);
    if (!template) throw new Error(`Unknown document template: ${templateId}`);
    const missingFields = template.fields
      .filter((field) => field.required && !values[field.key]?.trim())
      .map((field) => field.key);
    return { content: template.render(language, values), missingFields, template };
  }
}
