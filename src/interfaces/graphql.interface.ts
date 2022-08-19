import * as interfaces from './generated';

export type GraphQLResponse<K extends string, T> = {
  [key in K]: T;
}

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

export interface TimesheetPagingData {
  Timesheet: {
    data: interfaces.Timesheet[];
    paging: interfaces.PagingResult;
  },
};

export interface TaskPagingData {
  Task: {
    data: interfaces.Task[];
    paging: interfaces.PagingResult;
  },
};

export interface UserPayRatePagingData {
  UserPayRate: {
    data: interfaces.UserPayRate[];
    paging: interfaces.PagingResult;
  },
};
export interface IInvoiceItemInput {
  id?: string;
  project_id: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
};

export interface IInvoiceInput {
  id?: string;
  invoiceNumber?: number;
  issueDate: any;
  dueDate: any;
  poNumber: string;
  totalAmount: number;
  subtotal: number;
  taxPercent: number;
  discount: number;
  taxAmount?: number;
  discountAmount?: number;
  shipping?: number;
  notes: string;
  totalQuantity: number;
  needProject?: boolean;
  items: IInvoiceItemInput[];
};
