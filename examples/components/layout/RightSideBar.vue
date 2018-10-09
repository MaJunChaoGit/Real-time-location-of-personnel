<template>
  <div class="rp-right-side">
    <div class="rp-right-side__item rp-right-side__navigation" id="rp-outring"></div>
    <div class="rp-right-side__item">
      <rp-button-group direction="column">
        <rp-button round icon="rp-icon--custom__distance" @click="measureDistance" v-if="deviceType() === 'else'"></rp-button>
        <rp-button round icon="rp-icon--custom__area" @click="measureArea" v-if="deviceType() === 'else'"></rp-button>
        <rp-button round icon="rp-icon--custom__fullscreen" @click="screenHandle" v-if="deviceType() !== 'ios'"></rp-button>
        <rp-button round icon="rp-icon--custom__scenemode" @click="sceneModeHandle"></rp-button>
        <rp-button round :icon="featureButtonClass" @click="featuresControll"></rp-button>
      </rp-button-group>
    </div>
  </div>
</template>
<script>
import RpButtonGroup from './ButtonGroup';
import RpButton from '../functionality/Button';
import { getDeviceType } from '../../utils/dom';
import {
  Fullscreen,
  changeSceneMode,
  DrawHelper,
  CirclePrimitive
} from 'source/index';

export default {
  name: 'RpRightSide',

  components: {
    RpButtonGroup,
    RpButton
  },

  data() {
    return {
      featuresShow: false,
      featureButtonClass: 'rp-icon--custom__show'
    };
  },

  methods: {
    screenHandle() {
      Fullscreen(document.body);
    },
    sceneModeHandle() {
      changeSceneMode(global.viewer.scene);
    },
    measureDistance() {
      new DrawHelper(global.viewer.scene).startMeasureDistance();
    // new DrawHelper(global.viewer.scene).startDrawingMarker({}, function(position, primitive) {
        // primitive.removeAll();
    // });

      // let options = {};
      // options.center = {
      //   x: 1333605.1532864072,
      //   y: -4654559.234664471,
      //   z: 4137851.4716961407
      // };
      // options.radius = 1000;
      // options.asynchronous = false;
      // window.abc = new CirclePrimitive(options);
      // let primitives = viewer.scene.primitives;
      // primitives.add(window.abc);
      // primitives.remove(window.abc);


      // window.circle = new DrawHelper(global.viewer.scene).startDrawingCircle({}, function(center, radius, primitive) {
        // let primitives = viewer.scene.primitives;
        // primitives.remove(primitive);
      // });
    },
    measureArea() {
      new DrawHelper(global.viewer.scene).startMeasureArea();
    },
    deviceType() {
      return getDeviceType();
    },
    featuresControll() {
      this.featureButtonClass = this.featuresShow ? 'rp-icon--custom__show' : 'rp-icon--custom__hide'
      this.featuresShow = !global.viewer.features.show(this.featuresShow);

      
    }
  },
  mounted() {

  }
};
</script>