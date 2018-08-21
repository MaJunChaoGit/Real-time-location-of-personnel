import Vue from 'vue';
import Entry from './Entry';
import api from './api';

Vue.config.productionTip = false;
Vue.prototype.$api = api;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { Entry },
  template: '<Entry/>'
});
