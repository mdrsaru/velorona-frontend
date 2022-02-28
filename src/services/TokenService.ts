import FetchService from './FetchService';
//import { CredentialsEnum } from '../enum/requestEnum';
//import config from '../config/constants';

const service = new FetchService();

export default class TokenService {
  static renewAccessToken() {
    // Uncomment this after the API is built
    /*
    return service.request({
      url: `${config.apiUrl}/v1/token/refresh`,
      method: 'POST',
      credentials: CredentialsEnum.include,
    });
    */

    // Remove this after the API is built
    const token = localStorage.getItem('token');
    return service.request({
      url: `/test.json`,
      method: 'GET',
    })
    .then((response) => {
      if(token) {
        return response;
      } else {
        throw new Error('error')
      }
    })
  };

}
