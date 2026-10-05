import { desc, eq } from 'drizzle-orm';
import type { SavedSearch, SmartViewFilter, SearchSort } from '@meindocs/domain';
import { deserializeSmartViewFilters, serializeSmartViewFilters } from '@meindocs/domain';
import { savedSearches } from './schema';

type Db = ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>;
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function fromRow(row: typeof savedSearches.$inferSelect): SavedSearch {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    filters: deserializeSmartViewFilters(row.filters),
    sort: row.sort as SearchSort,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class SqliteSmartViewRepository {
  constructor(private readonly db: Db) {}

  async list() {
    const rows = await this.db.select().from(savedSearches).orderBy(desc(savedSearches.updatedAt));
    return rows.map(fromRow);
  }

  async getById(viewId: string) {
    const [row] = await this.db
      .select()
      .from(savedSearches)
      .where(eq(savedSearches.id, viewId))
      .limit(1);
    return row ? fromRow(row) : null;
  }

  async create(input: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
    const timestamp = now();
    const [row] = await this.db
      .insert(savedSearches)
      .values({
        id: input.id ?? id(),
        name: input.name,
        icon: input.icon,
        filters: serializeSmartViewFilters(input.filters),
        sort: input.sort,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();
    return fromRow(row);
  }

  async update(
    viewId: string,
    input: Partial<Pick<SavedSearch, 'name' | 'icon' | 'filters' | 'sort'>>,
  ) {
    await this.db
      .update(savedSearches)
      .set({
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.icon === undefined ? {} : { icon: input.icon }),
        ...(input.filters === undefined
          ? {}
          : { filters: serializeSmartViewFilters(input.filters as SmartViewFilter) }),
        ...(input.sort === undefined ? {} : { sort: input.sort }),
        updatedAt: now(),
      })
      .where(eq(savedSearches.id, viewId));
  }

  async remove(viewId: string) {
    await this.db.delete(savedSearches).where(eq(savedSearches.id, viewId));
  }
}
