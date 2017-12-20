import Vue from 'vue';
import VueRouter from 'vue-router';

import Root from './components/root.vue';
import Detail from './components/detail.vue';
import Privacy from './components/privacy.vue';
import Contact from './components/contact.vue';
import Terms from './components/terms.vue';


//const elRoot = document.getElementById('root');
//const elDetail = document.getElementById('detail');

//new Vue({
//    el: elRoot || elDetail,
//    store,
//    render: (h) => h(elroot ? root : detail)
//});


Vue.use(VueRouter);

const routes = [
  { path: '/', component: Root },
  { path: '/detail', component: Detail },
  { path: '/privacy', component: Privacy },
  { path: '/Contact', component: Contact },
  { path: '/Terms', component: Terms }
];

const router = new VueRouter({
  routes,
  mode: 'history'
});

export default router;


