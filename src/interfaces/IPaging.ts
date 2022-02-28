export interface IPaging {
  total: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
};

export interface IPagingResult<T> {
  paging: IPaging;
  results: T[];
};

