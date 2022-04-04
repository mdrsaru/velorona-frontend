import config from "../../config/constants";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${config.apiUrl}`,
});

const responseInterceptor = axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async function (error) {
    return Promise.reject(
      error.response
    );
  },
);

const requestInterceptor = axiosInstance.interceptors.request.use(
  function (config) {
    config.params = {
      ...config.params,
    };
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

axios.interceptors.request.eject(requestInterceptor);
axios.interceptors.request.eject(responseInterceptor);

export default axiosInstance;
