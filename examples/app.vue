<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import { Viewer } from '../src/index.js';

export default {
  name: 'App',
  mounted() {
    let viewer = new Viewer('cesiumContainer');
  }
};
</script>
