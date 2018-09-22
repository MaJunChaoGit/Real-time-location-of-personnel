import supViewer from 'cesium/Widgets/Viewer/Viewer';
import Camera from 'source/Scene/Camera';
import Cartesian3 from 'cesium/Core/Cartesian3';

/* eslint-disable no-undef */
// 初始化摄像机Symbol
const initializeCamera = Symbol();

class Viewer extends supViewer {
  constructor(el, options = {}) {
    super(el, options);

    this[initializeCamera]();

  }

  /**
   * 由于cesium会有版权声明,我们根据需要将其隐藏
   * @param  {Boolean} isShow true : 显示版权信息 false：隐藏版权信息
   * @return {Null}  null
   */
  creditControll(isShow = false) {
    this._cesiumWidget._creditContainer.style.display = isShow ? 'block' : 'none';
  }

  /**
   *
   */
  [initializeCamera]() {
    Object.setPrototypeOf(this.camera, Camera.prototype);
  }

  /**
   * [setLayersStyles description]
   * 设置地图图层的样式
   * @param {Number} options.brightness [亮度]
   * @param {Number} options.contrast   [对比度]
   * @param {Number} options.hue        [色相]
   * @param {Number} options.saturation [饱和度]
   * @param {Number} options.gamma      [gamma值]
   * @param {[type]} layer              [图层编号]
   */
  setLayersStyles({
    brightness = 1,
    contrast = 1,
    hue = 0,
    saturation = 1,
    gamma = 1
  }, layer = 0) {
    this.imageryLayers.get(Number(layer)).saturation = Number(saturation);
    this.imageryLayers.get(Number(layer)).brightness = Number(brightness);
    this.imageryLayers.get(Number(layer)).contrast = Number(contrast);
    this.imageryLayers.get(Number(layer)).hue = Number(hue);
    this.imageryLayers.get(Number(layer)).saturation = Number(saturation);
    this.imageryLayers.get(Number(layer)).gamma = Number(gamma);
  }

  /**
   * [setBloomStyles description]
   * 设置整体场景高光样式
   * @param {Boolean} options.show       [是否显示高光]
   * @param {Boolean} options.glowOnly   [自发光]
   * @param {Number}  options.contrast   [对比度]
   * @param {Number}  options.brightness [亮度]
   * delta并sigma用于计算高斯滤波器的权重
   * 公式是exp((-0.5 * delta * delta) / (sigma * sigma))
   * deltais 的默认值1.0
   * sigmais 的默认值2.0
   * stepSize是到下一个纹素的距离。默认是1.0
   * @param {Number}  options.delta      [色差值值]
   * @param {Number}  options.sigma      [description]
   * @param {Number}  options.stepSize   [光晕扩散大小]
   */
  setBloomStyles({
    show = true,
    glowOnly = false,
    contrast = 100,
    brightness = -0.15,
    delta = 1.0,
    sigma = 3.78,
    stepSize = 5.0
  }) {

    let bloom = this.scene.postProcessStages.bloom;
    bloom.enabled = Boolean(show);
    bloom.uniforms.glowOnly = Boolean(glowOnly);
    bloom.uniforms.contrast = Number(contrast);
    bloom.uniforms.brightness = Number(brightness);
    bloom.uniforms.delta = Number(delta);
    bloom.uniforms.sigma = Number(sigma);
    bloom.uniforms.stepSize = Number(stepSize);
  }
};
export default Viewer;
