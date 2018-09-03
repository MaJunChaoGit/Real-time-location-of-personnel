<template>
  <div class="rp-layout">
    <rp-right-side></rp-right-side>
    <rp-footer></rp-footer>
  </div>
</template>

<script>
import { viewerCesiumNavigationMixin } from 'source/index';

import RpFooter from './Footer';
import RpRightSide from './RightSideBar';

export default {
  name: 'RpLayout',

  mounted() {
    viewerCesiumNavigationMixin.mixinWidget(window.viewer, {}, {
      distance: 'rp-distance-legend',
      outring: 'rp-outring'
    });
  },

  components: {
    RpFooter,
    RpRightSide
  }
};
</script>