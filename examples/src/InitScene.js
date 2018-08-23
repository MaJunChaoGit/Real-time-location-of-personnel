import {
  Cesium3DTileStyle,
  Cartesian3,
  HeadingPitchRoll,
  Matrix4,
  Color,
  Cesium3DTileset
} from '../../src/index';

import api from '../api/index';

class InitScene {

  constructor(viewer) {
    this.api = api;
    // 初始化Viewer
    this.viewer = viewer;
    // 隐藏版权信息
    this.creditsHide();
    // 初始化图层样式, todo链接geoserver
    this.initImageryLayers();
    // 初始化场景
    this.initScene();
    // 初始化摄像机位置
    this.initCamera();
    // 初始化高光效果
    this.updatePostProcess();
  }
  /**
   * 初始化整个demo的场景
   * @return {[type]} [description]
   */
  initScene() {
    // 设置地形深度测试
    this.viewer.scene.globe.depthTestAgainstTerrain = false;
    this.viewer.scene.globe.enableLighting = true;

    // 加载数据
    let tileset = new Cesium3DTileset({
      url: this.api.newYork
    });
    tileset.style = new Cesium3DTileStyle({
      color: {
        evaluateColor: function(frameState, feature, result) {
          return Color.clone(Color.fromBytes(158, 203, 245, 51), result);
        }
      }
    });

    this.viewer.scene.primitives.add(tileset);
  }
  /**
   * 初始化相机的位置
   * @return {[type]} [description]
   */
  initCamera() {
    // 设置相机的初始位置
    let initialPosition = Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821, 753);
    /* eslint-disable new-cap */
    let initialOrientation = new HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
    this.viewer.scene.camera.flyTo({
      destination: initialPosition,
      orientation: initialOrientation,
      endTransform: Matrix4.IDENTITY
    });
  }
  /**
   * 初始化图层的颜色等
   * @return {[type]} [description]
   */
  initImageryLayers() {
    // 设置图层亮度与对比度
    this.viewer.imageryLayers.get(0).saturation = 0;
    this.viewer.imageryLayers.get(0).brightness = 0.36;
  }
  /**
   * 隐藏版权信息
   * @return {[type]} [description]
   */
  creditsHide() {
    console.log(this.viewer);
    this.viewer._cesiumWidget._creditContainer.style.display = 'none';
  }
  /**
   * 初始化高光效果
   * @return {[type]} [description]
   */
  updatePostProcess() {
    let viewModel = {
      show: true,
      glowOnly: false,
      contrast: 100,
      brightness: -0.15,
      delta: 1.0,
      sigma: 3.78,
      stepSize: 5.0
    };
    let bloom = this.viewer.scene.postProcessStages.bloom;
    bloom.enabled = Boolean(viewModel.show);
    bloom.uniforms.glowOnly = Boolean(viewModel.glowOnly);
    bloom.uniforms.contrast = Number(viewModel.contrast);
    bloom.uniforms.brightness = Number(viewModel.brightness);
    bloom.uniforms.delta = Number(viewModel.delta);
    bloom.uniforms.sigma = Number(viewModel.sigma);
    bloom.uniforms.stepSize = Number(viewModel.stepSize);
  }
}

export default InitScene;
