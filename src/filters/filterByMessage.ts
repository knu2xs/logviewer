import type { ParsedLogRow } from '../core/models';

export function filterByMessage(rows: ParsedLogRow[], searchText: string): ParsedLogRow[] {
  const query = searchText.trim().toLocaleLowerCase();

  if (query === '') {
    return rows;
  }

  return rows.filter((row) => row.message.toLocaleLowerCase().includes(query));
}