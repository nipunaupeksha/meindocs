import { and, desc, eq, like, or, type SQL } from 'drizzle-orm';
import type {
  CreateOrganisationInput,
  CreatePersonInput,
  Organisation,
  OrganisationFilters,
  OrganisationRepository,
  Person,
  PersonFilters,
  PersonRepository,
  UpdateOrganisationInput,
  UpdatePersonInput,
} from '@meindocs/domain';
import {
  actions,
  caseDocuments,
  caseOrganisations,
  casePeople,
  cases,
  documents,
  payments,
  reminders,
  organisations,
  people,
} from './schema';

type Db = ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>;
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const parseAddresses = (value: string | null) => {
  try {
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
};

export class SqlitePersonRepository implements PersonRepository {
  constructor(private readonly db: Db) {}
  async getById(personId: string) {
    const [row] = await this.db.select().from(people).where(eq(people.id, personId)).limit(1);
    return row ? this.hydrate(row) : null;
  }
  async list(filters: PersonFilters = {}) {
    const conditions: SQL<unknown>[] = [];
    if (filters.relationship) conditions.push(eq(people.relationship, filters.relationship));
    if (filters.search)
      conditions.push(
        or(
          like(people.firstName, `%${filters.search}%`),
          like(people.lastName, `%${filters.search}%`),
        )!,
      );
    const rows = await this.db
      .select()
      .from(people)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(people.lastName, people.firstName);
    return Promise.all(rows.map((row) => this.hydrate(row)));
  }
  async create(input: CreatePersonInput) {
    const timestamp = now();
    const [row] = await this.db
      .insert(people)
      .values({
        id: id(),
        firstName: input.firstName,
        lastName: input.lastName,
        preferredName: input.preferredName,
        dateOfBirth: input.dateOfBirth,
        relationship: input.relationship,
        addresses: JSON.stringify(input.addresses ?? []),
        nationality: input.nationality,
        identifiersEncrypted: input.identifiersEncrypted,
        email: input.email,
        phone: input.phone,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();
    return this.hydrate(row);
  }
  async update(personId: string, input: UpdatePersonInput) {
    const { addresses, ...rest } = input;
    await this.db
      .update(people)
      .set({
        ...rest,
        ...(addresses ? { addresses: JSON.stringify(addresses) } : {}),
        updatedAt: now(),
      })
      .where(eq(people.id, personId));
  }
  async delete(personId: string) {
    await this.db.delete(people).where(eq(people.id, personId));
  }
  private async hydrate(row: typeof people.$inferSelect): Promise<Person> {
    const [docs, linkedCases] = await Promise.all([
      this.db
        .select({ id: documents.id })
        .from(documents)
        .where(or(eq(documents.issuerPersonId, row.id), eq(documents.recipientPersonId, row.id))),
      this.db
        .select({ id: casePeople.caseId })
        .from(casePeople)
        .where(eq(casePeople.personId, row.id)),
    ]);
    return {
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      preferredName: row.preferredName ?? undefined,
      dateOfBirth: row.dateOfBirth ?? undefined,
      relationship: row.relationship,
      addresses: parseAddresses(row.addresses),
      nationality: row.nationality ?? undefined,
      identifiersEncrypted: row.identifiersEncrypted ?? undefined,
      email: row.email ?? undefined,
      phone: row.phone ?? undefined,
      documentIds: docs.map((item) => item.id),
      caseIds: linkedCases.map((item) => item.id),
    };
  }
}

export class SqliteOrganisationRepository implements OrganisationRepository {
  constructor(private readonly db: Db) {}
  async getById(organisationId: string) {
    const [row] = await this.db
      .select()
      .from(organisations)
      .where(eq(organisations.id, organisationId))
      .limit(1);
    return row ? this.hydrate(row) : null;
  }
  async list(filters: OrganisationFilters = {}) {
    const conditions: SQL<unknown>[] = [];
    if (filters.type) conditions.push(eq(organisations.type, filters.type));
    if (filters.search) conditions.push(like(organisations.name, `%${filters.search}%`));
    const rows = await this.db
      .select()
      .from(organisations)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(organisations.name);
    return Promise.all(rows.map((row) => this.hydrate(row)));
  }
  async create(input: CreateOrganisationInput) {
    const timestamp = now();
    const [row] = await this.db
      .insert(organisations)
      .values({
        id: id(),
        name: input.name,
        type: input.type,
        address: input.address,
        legalName: input.legalName,
        registrationNumber: input.registrationNumber,
        taxNumber: input.taxNumber,
        email: input.email,
        phone: input.phone,
        website: input.website,
        customerReference: input.customerReference,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();
    return this.hydrate(row);
  }
  async update(organisationId: string, input: UpdateOrganisationInput) {
    await this.db
      .update(organisations)
      .set({ ...input, updatedAt: now() })
      .where(eq(organisations.id, organisationId));
  }
  async delete(organisationId: string) {
    await this.db.delete(organisations).where(eq(organisations.id, organisationId));
  }
  private async hydrate(row: typeof organisations.$inferSelect): Promise<Organisation> {
    const [docs, linkedCases, paymentRows, actionRows] = await Promise.all([
      this.db
        .select({ id: documents.id })
        .from(documents)
        .where(
          or(
            eq(documents.issuerOrganisationId, row.id),
            eq(documents.recipientOrganisationId, row.id),
          ),
        ),
      this.db
        .select({ id: caseOrganisations.caseId })
        .from(caseOrganisations)
        .where(eq(caseOrganisations.organisationId, row.id)),
      this.db
        .select({ id: payments.id })
        .from(payments)
        .innerJoin(documents, eq(payments.documentId, documents.id))
        .where(
          or(
            eq(documents.issuerOrganisationId, row.id),
            eq(documents.recipientOrganisationId, row.id),
          ),
        ),
      this.db
        .select({ id: actions.id })
        .from(actions)
        .innerJoin(documents, eq(actions.documentId, documents.id))
        .where(
          or(
            eq(documents.issuerOrganisationId, row.id),
            eq(documents.recipientOrganisationId, row.id),
          ),
        ),
    ]);
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      address: row.address ?? undefined,
      legalName: row.legalName ?? undefined,
      registrationNumber: row.registrationNumber ?? undefined,
      taxNumber: row.taxNumber ?? undefined,
      email: row.email ?? undefined,
      phone: row.phone ?? undefined,
      website: row.website ?? undefined,
      customerReference: row.customerReference ?? undefined,
      documentIds: docs.map((item) => item.id),
      caseIds: linkedCases.map((item) => item.id),
      paymentIds: paymentRows.map((item) => item.id),
      actionIds: actionRows.map((item) => item.id),
    };
  }
}
