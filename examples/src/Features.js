import PickedFeature from './PickedFeature.js';
import ShadowMode from 'cesium/Scene/ShadowMode';
import Cesium3DTileset from 'cesium/Scene/Cesium3DTileset';
import Cesium3DTileStyle from 'cesium/Scene/Cesium3DTileStyle';
/**
 * 对3dTils进行封装,并对其的pick事件进行控制
 */
// 由于需要在不同组件中调用,为了提高效率,将其存下来
const featuresCollection = [];

class Features {
  constructor(viewer, url) {
    this.url = url;
    this.viewer = viewer;
    this.tileset = null;
    this.feature = null;
    featuresCollection.push(this);
    return this.add3dTiles();
  }

  /**
   * @Author   MJC
   * @DateTime 2018-12-22
   * @version  1.0.0
   * @param    {Number}   index 该倾斜摄影的缩影
   * @return   {Features}       该类的实例
   */
  static getFeatures(index = 0) {
    return featuresCollection[index];
  }

  /**
   * 添加倾斜数据
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   */
  add3dTiles() {
    let self = this;
    // 加载数据
    this.tileset = new Cesium3DTileset({
      url: self.url,
      skipLevelOfDetail: true,
      baseScreenSpaceError: 1024,
      skipScreenSpaceErrorFactor: 16,
      skipLevels: 1,
      immediatelyLoadDesiredLevelOfDetail: false,
      loadSiblings: false,
      cullWithChildrenBounds: true,
      dynamicScreenSpaceError: true,
      dynamicScreenSpaceErrorDensity: 0.00278,
      dynamicScreenSpaceErrorFactor: 4.0,
      dynamicScreenSpaceErrorHeightFalloff: 0.25,
      sphericalHarmonicCoefficients: undefined,
      specularEnvironmentMaps: undefined,
      luminanceAtZenith: 100,
      // imageBasedLightingFactor: new Cartesian2(1, 1),
      // lightColor: new Cartesian3(0, 0, 0)
      shadows: ShadowMode.DISABLED
    });
    // 设置3dtiles的颜色
    this.tileset.style = new Cesium3DTileStyle({
      color: {
        conditions: [
          ['${height} >= 250', 'rgba(0, 166, 200, 0.5)'],
          ['${height} >= 150', 'rgba(16, 182, 216, 0.5)'],
          ['${height} >= 100', 'rgba(37, 210, 234, 0.5)'],
          ['${height} >= 70', 'rgba(70, 205, 232, 0.5)'],
          ['${height} >= 50', 'rgba(101, 212, 234, 0.4)'],
          ['${height} >= 30', 'rgba(135, 214, 230, 0.4)'],
          ['${height} >= 10', 'rgba(197, 232, 239, 0.4)'],
          ['true', 'rgba(11, 94, 198, 0.0)']
        ]
      },
      show: '(Number(${id}) % 2 === 0 && Number(${id}) % 3 !== 0 && Number(${id}) % 5 !== 0) && (${height} > 0)'
    });

    // 返回一个Promise供外界使用,用来替代构造器中返回的this
    return new Promise((resolve) => {
      this.tileset.readyPromise.then(tileset => {
        this.viewer.scene.primitives.add(tileset);
        resolve(self);
      });
    });
  }
  /**
   * 开启悬浮与点击事件
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   */
  pickUp() {
    // 判断您是否是第一次点击
    if (!this.feature) {
      this.feature = new PickedFeature(global.viewer);
    } else {
      this.feature.initEvent();
    }
  }
  /**
   * 关闭pick功能
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   */
  pickDown() {
    if (!this.feature) return;
    this.feature.removeEvent();
  }
  /**
   * 控制倾斜摄影的显示与隐藏
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   * @param    {Boolean}
   */
  show(isShow) {
    if (isShow) {
      this.pickUp();
    } else {
      this.pickDown();
    }
    this.tileset.show = isShow;
    return isShow;
  }
};
export default Features;

