import '@/data.d';
export type TableColumns = {
  ApplicationID: number;
  URL: string;
  GET: boolean;
  GETSummary: string;
  POST: boolean;
  POSTSummary: string;
  PUT: boolean;
  PUTSummary: string;
  PATCH: boolean;
  PATCHSummary: string;
  DELETE: boolean;
  DELETESummary: string;
  Status: boolean;
  Application: Application;
}

export type TableListItem = TableBaseColumns & TableColumns;

export type TableListPagination = {
  total: number;
  pageSize: number;
  current: number;
};

export type TableListData = {
  list: TableListItem[];
  pagination: Partial<TableListPagination>;
};

export type TableListParams = {
  status?: string;
  name?: string;
  desc?: string;
  key?: number;
  pageSize?: number;
  currentPage?: number;
  filter?: Record<string, any[]>;
  sorter?: Record<string, any>;
};