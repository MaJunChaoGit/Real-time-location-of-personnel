<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import { Viewer } from '../src/index.js';
import 'cesium/Widgets/widgets.css';

export default {
  name: 'App',
  mounted() {
    let viewer = new Viewer('cesiumContainer');
    console.log(viewer);
  }
};
</script>
