import Vue from 'vue';

import store from './store';
import Root from './components/root.vue';
import Detail from './components/detail.vue';

const elRoot = document.getElementById('root');
const elDetail = document.getElementById('detail');

new Vue({
    el: elRoot || elDetail,
    store,
    render: (h) => h(elRoot ? Root : Detail)
});
