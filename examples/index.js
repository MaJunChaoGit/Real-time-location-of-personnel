import Vue from 'vue';
import Entry from './Entry';
import api from './api';
import axios from 'axios';
import Vuex from 'vuex';
import store from './vuex/store';

import './theme/src/index.scss';
import 'element-ui/lib/theme-chalk/index.css';
import { Row, Col, Select, Option, Switch } from 'element-ui';

Vue.use(Vuex);
Vue.config.productionTip = false;

Vue.component(Row.name, Row);
Vue.component(Col.name, Col);
Vue.component(Select.name, Select);
Vue.component(Option.name, Option);
Vue.component(Switch.name, Switch);
Vue.prototype.$http = axios;
Vue.prototype.$api = api;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { Entry },
  template: '<Entry/>'
});
