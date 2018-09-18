<template>
  <div class="rp-container">
    <div :id="mountedId" class="rp-content"></div>
    <rp-layout v-if="isReady"></rp-layout>
    <rp-loading @after-leave="loaded" background="#fff"></rp-loading>
  </div>
</template>

<script>
import InitScene from 'ex/src/InitScene';
import RpLayout from 'ex/components/layout/Layout';
import RpLoading from 'ex/components/functionality/Loading';
import {
  Cartesian3,
  HorizontalOrigin,
  VerticalOrigin
} from 'source/index.js';
let initScene = {};
export default {
  name: 'Entry',

  data() {
    return {
      mountedId: 'cesiumContainer',
      isReady: false
    };
  },

  components: {
    RpLayout,
    RpLoading
  },

  mounted() {
    initScene = new InitScene(this.mountedId);
    this.isReady = true;
  },

  methods: {
    loaded() {
      initScene.initCameraHandle();
    }
  }
};
</script>
