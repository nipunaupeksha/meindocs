import type { Organisation, Person } from './index';
import type {
  CreateOrganisationInput,
  CreatePersonInput,
  OrganisationFilters,
  OrganisationRepository,
  PersonFilters,
  PersonRepository,
  UpdateOrganisationInput,
  UpdatePersonInput,
} from './repositories';

export class PersonService {
  constructor(private readonly repository: PersonRepository) {}
  list(filters?: PersonFilters) {
    return this.repository.list(filters);
  }
  get(id: string) {
    return this.repository.getById(id);
  }
  create(input: CreatePersonInput) {
    return this.repository.create(input);
  }
  update(id: string, input: UpdatePersonInput) {
    return this.repository.update(id, input);
  }
  delete(id: string) {
    return this.repository.delete(id);
  }
}

export class OrganisationService {
  constructor(private readonly repository: OrganisationRepository) {}
  list(filters?: OrganisationFilters) {
    return this.repository.list(filters);
  }
  get(id: string) {
    return this.repository.getById(id);
  }
  create(input: CreateOrganisationInput) {
    return this.repository.create(input);
  }
  update(id: string, input: UpdateOrganisationInput) {
    return this.repository.update(id, input);
  }
  delete(id: string) {
    return this.repository.delete(id);
  }
}

export type PeopleManagementResult = Person | Organisation;
