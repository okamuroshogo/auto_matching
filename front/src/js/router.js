import Vue from 'vue';
import VueRouter from 'vue-router';

import Root from './components/root.vue';
import Detail from './components/detail.vue';
import Privacy from './components/privacy.vue';
import Contact from './components/contact.vue';
import Terms from './components/terms.vue';

Vue.use(VueRouter);

const routes = [
  { path: '/', component: Root },
  { path: '/detail/', component: Detail },
  { path: '/privacy/', component: Privacy },
  { path: '/contact/', component: Contact },
  { path: '/terms/', component: Terms }
];

const router = new VueRouter({
  routes,
  mode: 'history'
});

export default router;
