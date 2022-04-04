import FetchService from './FetchService';
import { CredentialsEnum } from '../enum/requestEnum';
import config from '../config/constants';

const service = new FetchService();

export default class TokenService {
  static renewAccessToken() {
    return service.request({
      url: `${config.apiUrl}/v1/token/refresh`,
      method: 'POST',
      credentials: CredentialsEnum.include,
      headers: {
        'Content-Type': `multipart/form-data`,
      },
    });
  };
}
