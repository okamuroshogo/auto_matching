import Vue from 'vue';
import VueRouter from 'vue-router';

import Root from './components/root.vue';
import Detail from './components/detail.vue';
import Privacy from './components/privacy.vue';
import Contact from './components/contact.vue';
import Terms from './components/terms.vue';
import Kamawanai from './components/kamawanai.vue';

const VueScrollTo = require('vue-scrollto');
Vue.use(VueScrollTo)
Vue.use(VueRouter);

const routes = [
  { path: '/', component: Root },
  { path: '/detail/', component: Detail },
  { path: '/privacy/', component: Privacy },
  { path: '/contact/', component: Contact },
  { path: '/kamawanai/', component: Kamawanai },
  { path: '/terms/', component: Terms }
];

const router = new VueRouter({
  routes,
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
   }
});

export default router;
