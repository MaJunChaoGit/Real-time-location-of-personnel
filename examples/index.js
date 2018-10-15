import Vue from 'vue';
import Entry from './Entry';
import api from './api';
import axios from 'axios';
import './theme/src/index.scss';

Vue.config.productionTip = false;

Vue.prototype.$http = axios;
Vue.prototype.$api = api;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { Entry },
  template: '<Entry/>'
});
