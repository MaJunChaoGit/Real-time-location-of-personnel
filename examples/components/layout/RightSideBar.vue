<template>
  <div class="rp-right-side">
    <div class="rp-right-side__item rp-right-side__navigation" id="rp-outring"></div>
    <div class="rp-right-side__item">
      <rp-button-group direction="column">
        <rp-button round icon="rp-icon-fullscreen" @click="screenHandle" v-if="buttonShowHandle()"></rp-button>
        <rp-button round icon="rp-icon-scenemode" @click="sceneModeHandle"></rp-button>
      </rp-button-group>
    </div>
  </div>
</template>
<script>
import RpButtonGroup from './ButtonGroup';
import RpButton from '../functionality/Button';
import {
  Fullscreen,
  changeSceneMode
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
    },
    buttonShowHandle() {
      if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) { //判断iPhone|iPad|iPod|iOS
        return false;
      } else if (/(Android)/i.test(navigator.userAgent)) {  //判断Android
        return true;
      } else {
        return true;
      };
    }
  }
};
</script>