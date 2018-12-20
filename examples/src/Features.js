import PickedFeature from './PickedFeature.js';
import Cesium3DTileset from 'cesium/Scene/Cesium3DTileset';
import Cesium3DTileStyle from 'cesium/Scene/Cesium3DTileStyle';
/**
 * 对3dTils进行封装,并对其的pick事件进行控制
 */
class Features {
  constructor(viewer, url) {
    this.url = url;
    this.viewer = viewer;
    this.tileset = null;
    this.feature = null;
    return this.add3dTiles();
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
      url: self.url
    });
    // this.tileset.style = new Cesium3DTileStyle({
    //   color: {
    //     evaluateColor: function(frameState, feature, result) {
    //       return Color.clone(Color.fromBytes(158, 203, 245, 51), result);
    //     }
    //   }
    // });
    this.tileset.style = new Cesium3DTileStyle({
      color: "(Number(${id}) % 2 === 0 && Number(${id}) % 3 !== 0 && Number(${id}) % 5 !== 0) ? color('cyan', 0.3) : color('purple', 0.1)"
    });
    /* eslint-disable no-undef */
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

