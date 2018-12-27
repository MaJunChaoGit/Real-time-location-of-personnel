import Vue from 'vue';
import Entry from './Entry';
import api from './api';
import axios from 'axios';
import './theme/src/index.scss';
import 'element-ui/lib/theme-chalk/index.css';
import { Row, Col, Select, Option, Switch } from 'element-ui';
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
  components: { Entry },
  template: '<Entry/>'
});
