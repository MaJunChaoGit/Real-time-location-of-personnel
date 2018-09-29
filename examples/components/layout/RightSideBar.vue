<template>
  <div class="rp-right-side">
    <div class="rp-right-side__item rp-right-side__navigation" id="rp-outring"></div>
    <div class="rp-right-side__item">
      <rp-button-group direction="column">
        <rp-button round icon="rp-icon--custom__distance" @click="measureDistance"></rp-button>
        <rp-button round icon="rp-icon--custom__area" @click="measureArea"></rp-button>
        <rp-button round icon="rp-icon-fullscreen" @click="screenHandle" v-if="getDeviceType() !== 'ios'"></rp-button>
        <rp-button round icon="rp-icon-scenemode" @click="sceneModeHandle"></rp-button>
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
  DrawHelper
} from 'source/index';

export default {
  name: 'RpRightSide',

  components: {
    RpButtonGroup,
    RpButton
  },

  methods: {
    screenHandle() {
      Fullscreen(document.body);
    },
    sceneModeHandle() {
      changeSceneMode(global.viewer.scene);
<<<<<<< HEAD
=======
    },
    measureDistance() {
      new DrawHelper(global.viewer.scene).startMeasureDistance();
    },
    measureArea() {
      new DrawHelper(global.viewer.scene).startMeasureArea();
    },
    buttonShowHandle() {
      if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) { // 判断iPhone|iPad|iPod|iOS
        return false;
      } else if (/(Android)/i.test(navigator.userAgent)) {  // 判断Android
        return true;
      } else {
        return true;
      }
>>>>>>> 660f6fc2b6a1c67970341f36a2df6b0b57106a96
    }
  }
};
</script>