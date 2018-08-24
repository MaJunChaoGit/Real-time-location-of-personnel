<template>
  <div :id="mountedId" class="rp-container">
    <rp-loading :visible="loading"></rp-loading>
  </div>
</template>

<script>
import RpLoading from './components/loading.vue';
// import InitScene from './src/InitScene';

import { 
  Viewer,
  Ion,
  IonImageryProvider,
  Cartesian3,
  HeadingPitchRoll,
  Matrix4
} from '../src/index';

export default {
  name: 'Entry',

  data() {
    return {
      mountedId: 'cesiumContainer',
      loading: true,
    };
  },

  components: {
    RpLoading
  },

  mounted() {
    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNTNlZjE1ZC1kMDZjLTQyNzQtYWJlMC04NzY4ODU0NjQzNmYiLCJpZCI6MjY2NywiaWF0IjoxNTM1MDgwNzU3fQ.t6hJUdDhs005ZfaF5O8PaxoBZ3g37Et7QG-ub852UXk';
    
    // let viewer = new Viewer(this.mountedId, {
    //   animation: false, // 是否创建动画小器件，左下角仪表
    //   baseLayerPicker: false, // 是否显示图层选择器
    //   fullscreenButton: false, // 是否显示全屏按钮
    //   geocoder: false, // 是否显示geocoder小器件，右上角查询按钮
    //   homeButton: false, // 是否显示Home按钮
    //   infoBox: false, // 是否显示信息框
    //   sceneModePicker: false, // 是否显示3D/2D选择器
    //   selectionIndicator: false, // 是否显示选取指示器组件
    //   timeline: false, // 是否显示时间轴
    //   navigationHelpButton: false, // 是否显示右上角的帮助按钮
    //   useDefaultRenderLoop: true, // 如果需要控制渲染循环，则设为true
    //   automaticallyTrackDataSourceClocks: true, // 自动追踪最近添加的数据源的时钟设置
    //   contextOptions: undefined, // 传递给Scene对象的上下文参数（scene.options）
    //   showRenderLoopErrors: true, // 如果设为true，将在一个HTML面板中显示错误信息
    //   imageryProvider: new IonImageryProvider({ assetId: 4 })
    // });
    
    // this.loading = false;
  //   // 设置相机的初始位置
  //   let initialPosition = Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821, 753);
  //   /* eslint-disable new-cap */
  //   let initialOrientation = new HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
  //   // 定位过去
  //   viewer.scene.camera.flyTo({
  //     destination: initialPosition,
  //     orientation: initialOrientation,
  //     endTransform: Matrix4.IDENTITY
  //   });

  //   let initScene = new InitScene(viewer);
  }
};
</script>
