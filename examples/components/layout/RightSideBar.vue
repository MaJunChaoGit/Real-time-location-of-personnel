<template>
  <div class="rp-right-side">
    <div class="rp-right-side__item rp-right-side__navigation" id="rp-outring"></div>
    <div class="rp-right-side__item">
      <rp-button-group direction="column">
        <rp-button round icon="rp-icon-fullscreen" @click="screenHandle"></rp-button>
        <rp-button round icon="rp-icon-scenemode" @click="SceneModeHandle"></rp-button>
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
    SceneModeHandle() {
      changeSceneMode(global.viewer.scene);
    }
  }
};
</script>