import * as interfaces from './generated';

export interface InvoicePagingData {
  Invoice: {
    data: interfaces.Invoice[];
    paging: interfaces.PagingResult;
  },
};

