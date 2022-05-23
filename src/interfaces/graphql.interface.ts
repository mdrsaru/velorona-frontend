import * as interfaces from './generated';

export interface InvoicePagingData {
  Invoice: {
    data: interfaces.Invoice[];
    paging: interfaces.PagingResult;
  },
};

export interface ClientPagingData {
  Client: {
    data: interfaces.Client[];
    paging: interfaces.PagingResult;
  },
};

export interface ProjectPagingData {
  Project: {
    data: interfaces.Project[];
    paging: interfaces.PagingResult;
  },
};

