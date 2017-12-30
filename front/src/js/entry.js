import Vue from 'vue';
import store from './store';
import router from './router.js';
import App from './app.vue';

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
