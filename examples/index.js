import Vue from 'vue';
import Entry from './Entry';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { Entry },
  template: '<Entry/>'
});
