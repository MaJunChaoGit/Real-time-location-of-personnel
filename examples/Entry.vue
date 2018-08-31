<template>
  <div class="rp-container">
    <div :id="mountedId"class="rp-content"></div>
    <div class="rp-tool">
      <div id="navigation-outring"></div>
      <div id="navigation-button"></div>
    </div>
    <rp-loading @after-leave="loaded" background="#fff"></rp-loading>
  </div>
</template>

<script>
import RpLoading from './components/loading.vue';
import InitScene from './src/InitScene';

let is = {};

export default {
  name: 'Entry',

  data() {
    return {
      mountedId: 'cesiumContainer',
      loading: false
    };
  },

  components: {
    RpLoading
  },

  mounted() {
    is = new InitScene(this.mountedId);
  },

  methods: {
    loaded() {
      is.initCameraHandle();
    }
  }
};
</script>
