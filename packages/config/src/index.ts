export const MEINDOCS_DEFAULT_API_URL = 'http://127.0.0.1:3000';
export const MEINDOCS_DB_FILENAME = './data/meindocs.sqlite';

export function getApiUrl(value?: string) {
  return value ?? MEINDOCS_DEFAULT_API_URL;
}
