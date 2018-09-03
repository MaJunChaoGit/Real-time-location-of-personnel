<template>
  <div class="rp-layout">
    <rp-outring></rp-outring>
    <rp-footer></rp-footer>
  </div>
</template>

<script>
import { viewerCesiumNavigationMixin } from 'source/index';

import RpFooter from './Footer';
import RpOutring from './Outring';

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
    RpOutring
  }
};
</script>