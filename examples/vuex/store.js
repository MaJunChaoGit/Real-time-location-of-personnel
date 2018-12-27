import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

var store = new Vuex.Store({
  // 该模块的初始状态
  state: {},
  // getters
  getters: {
    getBuild: state => {
      return {
        build: state.build
      };
    },
    getCar: state => {
      return {
        car: state.car
      };
    },
    getLocation: state => {
      return {
        location: state.location
      };
    },
    getBorough: state => {
      return {
        borough: state.borough
      };
    },
    getHeatmap: state => {
      return {
        heatmap: state.heatmap
      };
    }
  },
  // 相关的 mutations
  mutations: {
    SET_BUILD(state, load) {
      state.build = load;
    },
    SET_CAR(state, load) {
      state.car = load;
    },
    SET_LOCATION(state, load) {
      state.location = load;
    },
    SET_BOROUGH(state, load) {
      state.borough = load;
    },
    SET_HEATMAP(state, load) {
      state.heatmap = load;
    }
  }
});
export default store;
