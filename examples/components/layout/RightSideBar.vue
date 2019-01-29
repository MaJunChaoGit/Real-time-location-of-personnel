<template>
  <div class="rp-right-side">
    <div class="rp-right-side__item rp-right-side__navigation" id="rp-outring"></div>
    <div class="rp-right-side__item">
      <rp-button-group direction="column">
        <transition name="bounce">
          <rp-button round icon="rp-icon--custom__distance" @click="measureDistance" v-if="deviceType() === 'else' && buttonShow"></rp-button>
        </transition>
        <transition name="bounce">
          <rp-button round icon="rp-icon--custom__area" @click="measureArea" v-if="deviceType() === 'else' && buttonShow"></rp-button>
        </transition>
        <transition name="bounce">
          <rp-button round icon="rp-icon--custom__fullscreen" @click="screenHandle" v-if="deviceType() !== 'ios' && buttonShow"></rp-button>
        </transition>
        <transition name="bounce">
          <rp-button round icon="rp-icon--custom__scenemode" @click="sceneModeHandle" v-if="buttonShow"></rp-button>
        </transition>
        <rp-button round :icon="customButtonClass" @click="buttonShowControll"></rp-button>
      </rp-button-group>
    </div>
  </div>
</template>
<script>
import {
  Fullscreen,
  changeSceneMode,
  DrawHelper
} from 'source/index';
import RpButtonGroup from './ButtonGroup';
import RpButton from '../functionality/Button';
import Features from 'ex/src/Features';
import carToDegrees from 'ex/src/carToDegrees';
import api from 'ex/api/index';
import createGuid from 'cesium/Core/createGuid';
import { crtTimeFtt, getDeviceType } from 'ex/utils/dom';
export default {
  name: 'RpRightSide',

  components: {
    RpButtonGroup,
    RpButton
  },

  data() {
    return {
      buttonShow: true,
      customButtonClass: 'rp-icon--custom__hide'
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
      
       if (process.env.NODE_ENV !== 'development') {
         // 下面是保存数据的方法
         new DrawHelper(global.viewer.scene).startMeasureDistance((positions, time) => {
           let movingTarget = {
             id: createGuid(),
             options: {
               type: Math.ceil(Math.random() * 6),
               phone: '13376090266',
               ascriptions: '第一中队'
             },
             timePositions: []
           };
           let date = new Date('2018-10-17 23:06:00');
           positions.forEach((val, index) => {
             let position = carToDegrees(val);
             position.lon = position.lon;
             position.lat = position.lat;
             position.height = position.height;
             if (index !== 0) date.setMilliseconds(time[index] + 5000);
             position.time = crtTimeFtt(date);     
             movingTarget.timePositions.push(position);
           });
           movingTarget.startTime = movingTarget.timePositions[0].time;
           movingTarget.endTime = movingTarget.timePositions[movingTarget.timePositions.length - 1].time;
           this.$http.post(api.saveMovingTarget, movingTarget)
           .then(function(response) {
             console.log(response);
           })
           .catch(function(error) {
             console.log(error);
           });
         });
       } else {
        Features.getFeatures().pickDown();
        new DrawHelper(global.viewer.scene).startMeasureDistance(() => {
          Features.getFeatures().pickUp();
        });
      }
    },
    measureArea() {
      Features.getFeatures().pickDown();
      new DrawHelper(global.viewer.scene).startMeasureArea(() => {
        Features.getFeatures().pickUp();
      });
    },
    deviceType() {
      return getDeviceType();
    },
    buttonShowControll() {
      this.customButtonClass = this.buttonShow ? 'rp-icon--custom__show' : 'rp-icon--custom__hide';
      this.buttonShow = !this.buttonShow;
    }
  },
  mounted() {

  }
};
</script>