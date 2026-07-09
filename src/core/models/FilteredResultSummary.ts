export interface FilteredResultSummary {
  visibleCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  isEmptyResult: boolean;
  latestTimestamp: Date | null;
}