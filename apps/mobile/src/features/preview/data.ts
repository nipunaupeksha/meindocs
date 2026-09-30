export type Language = 'en' | 'de';
export type Localized = { en: string; de: string };
export type Category = 'insurance' | 'home' | 'work' | 'tax';
export type TaxReview = {
  taxRelevant?: boolean;
  expenseCategory?: string;
  taxYear?: number;
  netAmount?: number;
  vatAmount?: number;
  grossAmount?: number;
  vatRate?: number;
  businessUsePercent?: number;
  reviewStatus?: 'needs_review' | 'reviewed' | 'rejected';
};
export type MockDocument = {
  id: string;
  title: Localized;
  issuer: string;
  category: Category;
  date: string;
  pages: number;
  size: string;
  amount?: number;
  favorite: boolean;
  reviewed: boolean;
  localUri?: string;
  thumbnailUri?: string;
  sha256?: string;
  extractedText?: string;
  ocrStatus?: 'completed' | 'needs-review' | 'unsupported';
  tax?: TaxReview;
  summary?: string;
  referenceNumber?: string;
  tags?: string[];
  personId?: string;
  organisationId?: string;
  actionRequired?: boolean;
  unpaidBill?: boolean;
  expiryStatus?: 'active' | 'expired' | 'expiring';
};
export type MockTask = {
  id: string;
  title: Localized;
  documentId?: string;
  date: string;
  expiryDate?: string;
  done: boolean;
  priority: 'normal' | 'high';
  notificationId?: string;
};
export type MockCase = {
  id: string;
  title: string;
  type:
    | 'immigration'
    | 'tax'
    | 'housing'
    | 'insurance'
    | 'employment'
    | 'family'
    | 'vehicle'
    | 'custom';
  status: 'open' | 'action_required' | 'waiting' | 'completed' | 'archived';
  deadline?: string;
  documentIds: string[];
  checklist: { id: string; title: string; completed: boolean }[];
  people: string[];
  organisations: string[];
  timeline: { id: string; label: string; date: string }[];
};
export type MockPerson = {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  relationship: 'self' | 'spouse' | 'child' | 'dependent' | 'other';
  dateOfBirth?: string;
  nationality?: string;
  addresses: string[];
  documentIds: string[];
  caseIds: string[];
};
export type MockOrganisation = {
  id: string;
  name: string;
  type:
    | 'government'
    | 'employer'
    | 'landlord'
    | 'insurance'
    | 'bank'
    | 'utility'
    | 'healthcare'
    | 'business'
    | 'education'
    | 'other';
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  customerReference?: string;
  documentIds: string[];
  caseIds: string[];
  paymentIds: string[];
  actionIds: string[];
};
export const initialPeople: MockPerson[] = [
  {
    id: 'me',
    firstName: 'Max',
    lastName: 'Mustermann',
    preferredName: 'Max',
    relationship: 'self',
    nationality: 'German',
    addresses: ['Hauptstraße 1, 10115 Berlin'],
    documentIds: ['salary'],
    caseIds: [],
  },
];
export const initialOrganisations: MockOrganisation[] = [
  {
    id: 'tax-office',
    name: 'Finanzamt Berlin',
    type: 'government',
    address: 'Berlin',
    email: 'post@finanzamt.example',
    documentIds: ['receipt-train'],
    caseIds: ['tax-2026'],
    paymentIds: [],
    actionIds: [],
  },
];
export const initialCases: MockCase[] = [
  {
    id: 'tax-2026',
    title: 'Tax filing 2026',
    type: 'tax',
    status: 'action_required',
    deadline: '2027-07-31',
    documentIds: ['receipt-desk', 'receipt-train'],
    people: [],
    organisations: ['Tax office'],
    checklist: [
      { id: 'tax-1', title: 'Review receipts', completed: true },
      { id: 'tax-2', title: 'Prepare filing package', completed: false },
    ],
    timeline: [{ id: 'tax-created', label: 'Case created', date: '2026-09-01' }],
  },
];
export type StorageId = 'local' | 'icloud' | 'google' | 'onedrive';
export const storageNames: Record<StorageId, string> = {
  local: 'On this device',
  icloud: 'iCloud Drive',
  google: 'Google Drive',
  onedrive: 'OneDrive',
};
export const categories: Record<Category, Localized> = {
  insurance: { en: 'Insurance', de: 'Versicherung' },
  home: { en: 'Home & living', de: 'Wohnen' },
  work: { en: 'Work', de: 'Arbeit' },
  tax: { en: 'Tax & receipts', de: 'Steuern & Belege' },
};
export const initialDocuments: MockDocument[] = [
  {
    id: 'insurance',
    title: { en: 'Liability insurance 2026', de: 'Haftpflichtversicherung 2026' },
    issuer: 'Allianz',
    category: 'insurance',
    date: '2026-09-20',
    pages: 4,
    size: '1.2 MB',
    favorite: true,
    reviewed: false,
  },
  {
    id: 'rent',
    title: { en: 'Rental agreement', de: 'Mietvertrag' },
    issuer: 'Berlin Living',
    category: 'home',
    date: '2026-09-18',
    pages: 8,
    size: '2.4 MB',
    favorite: true,
    reviewed: true,
  },
  {
    id: 'salary',
    title: { en: 'September payslip', de: 'Gehaltsabrechnung September' },
    issuer: 'Studio Nord GmbH',
    category: 'work',
    date: '2026-09-16',
    pages: 2,
    size: '480 KB',
    favorite: false,
    reviewed: true,
  },
  {
    id: 'receipt-desk',
    title: { en: 'Home office desk', de: 'Schreibtisch fürs Homeoffice' },
    issuer: 'IKEA Berlin',
    category: 'tax',
    date: '2026-09-14',
    pages: 1,
    size: '320 KB',
    amount: 249,
    favorite: false,
    reviewed: false,
  },
  {
    id: 'receipt-train',
    title: { en: 'Business trip · Hamburg', de: 'Dienstreise · Hamburg' },
    issuer: 'Deutsche Bahn',
    category: 'tax',
    date: '2026-09-10',
    pages: 1,
    size: '210 KB',
    amount: 89.9,
    favorite: false,
    reviewed: true,
  },
  {
    id: 'receipt-book',
    title: { en: 'Professional reference book', de: 'Fachbuch' },
    issuer: 'Dussmann',
    category: 'tax',
    date: '2026-08-28',
    pages: 1,
    size: '180 KB',
    amount: 49.9,
    favorite: false,
    reviewed: true,
  },
];
export const initialTasks: MockTask[] = [
  {
    id: 'renewal',
    title: { en: 'Review insurance renewal', de: 'Versicherungsverlängerung prüfen' },
    documentId: 'insurance',
    date: '2026-09-25',
    expiryDate: '2026-09-30',
    done: false,
    priority: 'high',
  },
  {
    id: 'rent-check',
    title: { en: 'Check rental agreement', de: 'Mietvertrag prüfen' },
    documentId: 'rent',
    date: '2026-09-28',
    done: false,
    priority: 'normal',
  },
  {
    id: 'tax-check',
    title: { en: 'Collect tax receipts', de: 'Steuerbelege sammeln' },
    date: '2026-10-05',
    done: true,
    priority: 'normal',
  },
];
export function formatDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T12:00:00Z`));
}
export function money(value: number, language: Language) {
  return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
