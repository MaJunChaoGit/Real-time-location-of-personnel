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
import carToDegrees from 'ex/src/carToDegrees';
import api from 'ex/api/index';
import createGuid from 'cesium/Core/createGuid';
import { crtTimeFtt } from 'ex/utils/dom';
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
      new DrawHelper(global.viewer.scene).startMeasureDistance((positions, time) => {
        let movingTarget = {
          id: createGuid(),
          options: {
            type: '1',
            phone: '13376090266',
            ascriptions: '第一中队'
          },
          timePositions: []
        };
        let offset = 0;
        positions.forEach((val, index) => {
          let position = carToDegrees(val);
          position.lon = position.lon;
          position.lat = position.lat;
          position.height = position.height;
          let date = new Date(time[index]);
          offset = date.getMinutes() - new Date().date.getMinutes();
          date.setTime(date.setMinutes(6 + offset));

          let date1 = new Date('2018-10-17 23:06:00');
          date1.setMinutes(date.getMinutes());
          date1.setSeconds(date.getSeconds());
          position.time = crtTimeFtt(date1);
          movingTarget.timePositions.push(position);
        });
        console.log(movingTarget.id);
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
    },
    measureArea() {
      new DrawHelper(global.viewer.scene).startMeasureArea();
    },
    deviceType() {
      return getDeviceType();
    },
    featuresControll() {
      this.featureButtonClass = this.featuresShow ? 'rp-icon--custom__show' : 'rp-icon--custom__hide';
      this.featuresShow = !global.viewer.features.show(this.featuresShow);
    }
  },
  mounted() {

  }
};
</script>