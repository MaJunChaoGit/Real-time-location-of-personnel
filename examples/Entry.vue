<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import { Viewer } from '../src/index.js';

export default {
  name: 'Entry',
  mounted() {
    let viewer = new Viewer('cesiumContainer');
  }
};
</script>
