import {
  Viewer,
  Ion,
  IonImageryProvider
} from 'source/index';

class InitScene {

  constructor(el) {
    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNTNlZjE1ZC1kMDZjLTQyNzQtYWJlMC04NzY4ODU0NjQzNmYiLCJpZCI6MjY2NywiaWF0IjoxNTM1MDgwNzU3fQ.t6hJUdDhs005ZfaF5O8PaxoBZ3g37Et7QG-ub852UXk';
    this.isComplete = false;
    global.viewer = new Viewer(el, {
      animation: false, // 是否创建动画小器件，左下角仪表
      baseLayerPicker: false, // 是否显示图层选择器
      fullscreenButton: false, // 是否显示全屏按钮
      geocoder: false, // 是否显示geocoder小器件，右上角查询按钮
      homeButton: false, // 是否显示Home按钮
      infoBox: false, // 是否显示信息框
      sceneModePicker: false, // 是否显示3D/2D选择器
      selectionIndicator: false, // 是否显示选取指示器组件
      timeline: false, // 是否显示时间轴
      navigationHelpButton: false, // 是否显示右上角的帮助按钮
      useDefaultRenderLoop: true, // 如果需要控制渲染循环，则设为true
      automaticallyTrackDataSourceClocks: true, // 自动追踪最近添加的数据源的时钟设置
      contextOptions: undefined, // 传递给Scene对象的上下文参数（scene.options）
      showRenderLoopErrors: true, // 如果设为true，将在一个HTML面板中显示错误信息
      imageryProvider: new IonImageryProvider({ assetId: 4 })
    });

    // 隐藏版权信息
    global.viewer.creditControll();

    global.viewer.setLayersStyles({
      saturation: 0,
      brightness: 0.36
    });

    global.viewer.setBloomStyles({});

    global.viewer.scene.globe.enableLighting = true;
    this.isComplete = true;
  }

}

export default InitScene;
