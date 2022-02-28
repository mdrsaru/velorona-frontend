import { IFetchService } from '../interfaces/IHttp';

export default class FetchService {
  request(args: IFetchService): Promise<Response> {
    const { url, ...options } = args;
    return fetch(url, options);
  }
}

