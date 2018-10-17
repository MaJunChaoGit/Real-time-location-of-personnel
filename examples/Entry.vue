<template>
  <div class="rp-container">
    <div :id="mountedId" class="rp-content"></div>
    <rp-layout v-if="isReady"></rp-layout>
    <rp-loading @after-leave="loaded" background="#fff"></rp-loading>
  </div>
</template>

<script>
import InitScene from 'ex/src/InitScene';
import RpLayout from 'ex/components/layout/Layout';
import RpLoading from 'ex/components/functionality/Loading';
import Features from 'ex/src/Features';
import {
  Cartesian3,
  HorizontalOrigin,
  VerticalOrigin,
  HeadingPitchRoll,
  Matrix4,
  MovingTarget,
  MovingTargetCollection
} from 'source/index.js';
import api from './api/index';

export default {
  name: 'Entry',

  data() {
    return {
      mountedId: 'cesiumContainer',
      isReady: false
    };
  },

  components: {
    RpLayout,
    RpLoading
  },

  mounted() {
    let initScene = new InitScene(this.mountedId);
    this.isReady = initScene.isComplete;
  },

  methods: {
    loaded() {
      // 设置相机的初始位置
      let initialPosition = Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821, 753);
      /* eslint-disable new-cap */
      let initialOrientation = new HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
      setTimeout(() => {

        global.viewer.scene.camera.fly({

          destination: initialPosition,
          duration: 4,
          complete: () => {
            // 新建倾斜摄影对象
            global.viewer.features = new Features(global.viewer, api.newYork);
            // 开启倾斜摄影的pick模式
            global.viewer.features.pickUp();
            // 定位至倾斜摄影
            global.viewer.scene.camera.flyTo({
              // 目的地
              destination: initialPosition, 
              // 飞行时间
              duration: 2,
              orientation: initialOrientation,
              endTransform: Matrix4.IDENTITY,
              complete: () => {
                // 请求动目标数据
                this.$http.get(api.movingTargets)
                .then(response => {
                  let data = response.data;
                  // 新建动目标集合
                  let collection = new MovingTargetCollection(global.viewer);
                  // 设置生命周期
                  collection.setLifyCircle(data.overallStarttime, data.overallEndtime);
                  // 设置时钟效率
                  collection.setMultiplier(1);
                  // 遍历数据添加动目标
                  data.data.forEach(val => {
                    collection.add(new MovingTarget(global.viewer, val));
                  });
                })
                .catch(function(error) {
                  console.log(error);
                });
              }
            });
          }
        });
      }, 1000);
    }
  }
};
</script>
