<template>
  <div class="rp-layout">
    <rp-tree></rp-tree>
    <rp-infobox></rp-infobox>
    <rp-right-side></rp-right-side>
    <rp-footer></rp-footer>
  </div>
</template>

<script>
import { viewerCesiumNavigationMixin } from 'source/index';

import RpFooter from './Footer';
import RpTree from '../functionality/Tree';
import RpRightSide from './RightSideBar';
import RpInfobox from '../functionality/InfoBox';

export default {
  name: 'RpLayout',

  mounted() {
    viewerCesiumNavigationMixin.mixinWidget(global.viewer, {}, {
      distance: 'rp-distance-legend',
      outring: 'rp-outring'
    });
  },

  components: {
    RpFooter,
    RpRightSide,
    RpInfobox,
    RpTree
  }

};
</script>