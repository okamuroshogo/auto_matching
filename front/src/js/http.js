import axios from 'axios';
const http = axios;

export default (Vue) => {
  Vue.http = http;
  Object.defineProperties(Vue.prototype, {
    $http: {
      get () {
        return http;
      }
    }
  });
};
