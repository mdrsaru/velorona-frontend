import { CredentialsEnum } from '../enum/requestEnum';
import { IPagingResult } from './IPaging';

export interface IHttp {
  get<T>(args: any): Promise<T>;
  post<T>(args: any): Promise<T>;
  put<T>(args: any): Promise<T>;
  delete<T>(args: any): Promise<T>;
}

export interface IError {
  status: number;
  data: any;
  headers: any;
}

export interface IHttpParam {
  endpoint: string;
  payload?: any;
  config?: any;
}

export interface IPagingResponse<T> {
  message: string;
  data: IPagingResult<T>;
}

export interface IResponse<T> {
  message: string;
  data: T;
}

export interface IFetchService {
  url: string;
  method: string;
  credentials?: CredentialsEnum | undefined;
  headers?: Headers | string[][];
  body?: any;
}

