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
              const testData = {
                overallStarttime: '2018-06-01 16:22:00',
                overallEndtime: '2019-06-01 16:22:00',
                center: { lon: 120.16, lat: 20, height: 1500000.0 },
                multiplier: 5,
                data: [
                  {
                    id: 'ship1',
                    startTime: '2018-06-01 16:22:00',
                    endTime: '2018-06-01 17:07:00',
                    options: {
                      id: 'ship1',
                      type: '6',
                      country: '中国'
                    },
                    timePositions: [
                      { time: '2018-06-01 16:22:00', lon: 112.92772065383062, lat: 21.963131324556635, height: 0 },
                      { time: '2018-06-01 16:23:00', lon: 113.04087502788731, lat: 21.943465855806593, height: 1.016336864246611 },
                      { time: '2018-06-01 16:24:00', lon: 113.11635603631115, lat: 21.916451168387294, height: 1.0732885402049848 },
                      { time: '2018-06-01 16:25:00', lon: 113.17679450181424, lat: 21.882342160504297, height: 0.9284692032590808 },
                      { time: '2018-06-01 16:26:00', lon: 113.28215149556617, lat: 21.84862493638314, height: 1.2576071824790942 },
                      { time: '2018-06-01 16:27:00', lon: 113.36487119493233, lat: 21.814673943353483, height: 1.6300798249245425 },
                      { time: '2018-06-01 16:28:00', lon: 113.42492918605265, lat: 21.794378822993146, height: 1.0836513407237898 },
                      { time: '2018-06-01 16:29:00', lon: 113.49993562297243, lat: 21.76725472656386, height: 0.8755026913420768 },
                      { time: '2018-06-01 16:30:00', lon: 113.55239543972834, lat: 21.746865822585793, height: 1.3319850641034545 },
                      { time: '2018-06-01 16:31:00', lon: 113.62513182468297, lat: 21.725542556417995, height: 4.656612873077393e-10 },
                      { time: '2018-06-01 16:32:00', lon: 113.6795400235689, lat: 21.713134884169072, height: 1.2833254892726422 },
                      { time: '2018-06-01 16:33:00', lon: 113.76900233843597, lat: 21.720636617286505, height: 1.41187925616024 },
                      { time: '2018-06-01 16:34:00', lon: 113.81547647020327, lat: 21.723487078194765, height: 0 },
                      { time: '2018-06-01 16:35:00', lon: 113.9030968716543, lat: 21.72832638497984, height: 1.4789004599692366 },
                      { time: '2018-06-01 16:36:00', lon: 113.96255098364918, lat: 21.756309759644544, height: 1.5825637174068405 },
                      { time: '2018-06-01 16:37:00', lon: 114.02954242106622, lat: 21.75662067103283, height: 1.332253321064515 },
                      { time: '2018-06-01 16:38:00', lon: 114.06676589995695, lat: 21.749861064596313, height: 1.1887265308863817 },
                      { time: '2018-06-01 16:39:00', lon: 114.14115053191487, lat: 21.743234661711707, height: 1.2998109274311498 },
                      { time: '2018-06-01 16:40:00', lon: 114.21547387812751, lat: 21.74349210656915, height: 1.1912325400427324 },
                      { time: '2018-06-01 16:41:00', lon: 114.28972079207574, lat: 21.76445871568505, height: 0.9874990845289092 },
                      { time: '2018-06-01 16:42:00', lon: 114.34909600877305, lat: 21.785347638231464, height: 1.5559906382567792 },
                      { time: '2018-06-01 16:43:00', lon: 114.43816832284092, lat: 21.79935210319125, height: 1.3603859363702275 },
                      { time: '2018-06-01 16:44:00', lon: 114.50492748636088, lat: 21.847832479793936, height: 0.9521970985496105 },
                      { time: '2018-06-01 16:45:00', lon: 114.5717013891165, lat: 21.875537605154197, height: 1.5896106712511373 },
                      { time: '2018-06-01 16:46:00', lon: 114.65331254241038, lat: 21.87557893149561, height: 1.23483763206441 },
                      { time: '2018-06-01 16:47:00', lon: 114.71266517426551, lat: 21.91703180326857, height: 1.5746564120921724 },
                      { time: '2018-06-01 16:48:00', lon: 114.77942458439435, lat: 21.930821481226577, height: 1.452149101475133 },
                      { time: '2018-06-01 16:49:00', lon: 114.84618635785641, lat: 21.95148848164786, height: 1.2552898560333217 },
                      { time: '2018-06-01 16:50:00', lon: 114.94262510048812, lat: 21.985888314788745, height: 1.6057143015229922 },
                      { time: '2018-06-01 16:51:00', lon: 115.06875129494432, lat: 22.013251708318343, height: 0.9707145635204343 },
                      { time: '2018-06-01 16:52:00', lon: 115.1207138718157, lat: 22.040733648002295, height: 1.1474385057551262 },
                      { time: '2018-06-01 16:53:00', lon: 115.16525355613588, lat: 22.061317194994523, height: 0.8485872672694166 },
                      { time: '2018-06-01 16:54:00', lon: 115.20984669297351, lat: 22.095692935681424, height: 1.3342357179125293 },
                      { time: '2018-06-01 16:55:00', lon: 115.2396546771497, lat: 22.137013235811065, height: 1.6314655386255361 },
                      { time: '2018-06-01 16:56:00', lon: 115.27695257076584, lat: 22.192111048553887, height: 0.9897167466107949 },
                      { time: '2018-06-01 16:57:00', lon: 115.28453689085957, lat: 22.233507102373995, height: 1.144006230497162 },
                      { time: '2018-06-01 16:58:00', lon: 115.29212392464392, lat: 22.274904053562352, height: 1.3032340504484659 },
                      { time: '2018-06-01 16:59:00', lon: 115.28489705658254, lat: 22.323268739752834, height: 1.0265223588390917 },
                      { time: '2018-06-01 17:00:00', lon: 115.28516747277529, lat: 22.392322793143485, height: 1.2067293782710065 },
                      { time: '2018-06-01 17:01:00', lon: 115.28538240687321, lat: 22.447573378734, height: 0.9623749070010443 },
                      { time: '2018-06-01 17:02:00', lon: 115.28564523409469, lat: 22.516644192860674, height: 0.9985308517474624 },
                      { time: '2018-06-01 17:03:00', lon: 115.28600351554918, lat: 22.613361263302625, height: 1.4364516498813142 },
                      { time: '2018-06-01 17:04:00', lon: 115.29511857559733, lat: 22.676038894786913, height: 0 },
                      { time: '2018-06-01 17:05:00', lon: 115.30120317939677, lat: 22.696225412621697, height: 0 },
                      { time: '2018-06-01 17:07:00', lon: 115.30120317939677, lat: 22.696225412621697, height: 0 }
                    ]
                  }
                ]
              };
                // 请求动目标数据
                // this.$http.get(api.movingTargets)
                // .then(response => {
                //   let data = response.data;
                //   // 新建动目标集合
                //   let collection = new MovingTargetCollection(global.viewer);
                //   // 设置生命周期
                //   collection.setLifyCircle(data.overallStarttime, data.overallEndtime);
                //   // 设置时钟效率
                //   collection.setMultiplier(1);
                //   // 遍历数据添加动目标
                //   data.data.forEach(val => {
                //     collection.add(new MovingTarget(global.viewer, val));
                //   });
                // })
                // .catch(function(error) {
                //   console.log(error);
                // });
                let data = testData;
                // 新建动目标集合
                let collection = new MovingTargetCollection(global.viewer);
                // 设置生命周期
                collection.setLifyCircle(data.overallStarttime, data.overallEndtime);
                // 设置时钟效率
                collection.setMultiplier(0.1);
                // 遍历数据添加动目标
                data.data.forEach(val => {
                  collection.add(new MovingTarget(global.viewer, val));
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
