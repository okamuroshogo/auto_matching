import Vue from 'vue';
import store from './store';
import http from 'http';
import router from './router.js';
import App from './app.vue';

Vue.use(http, { store });

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
