import PickedFeature from './PickedFeature.js';
import Cesium3DTileset from 'cesium/Scene/Cesium3DTileset';
import Cesium3DTileStyle from 'cesium/Scene/Cesium3DTileStyle';
import Color from 'cesium/Core/Color';

class Features {
  constructor(viewer, url) {
    this.url = url;
    this.viewer = viewer;
    this.tileset = null;
    this.feature = null;
    this.add3dTiles();
  }
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
      color: "(Number(${id}) % 2 === 0 && Number(${id}) % 3 !== 0 && Number(${id}) % 5 !== 0) ? color('cyan', 0.9) : color('purple', 0.1)"
    });
    this.viewer.scene.primitives.add(this.tileset);
  }
  pickUp() {
    if (!this.feature) {
      this.feature = new PickedFeature(global.viewer);
    } else {
      this.feature.initEvent();
    }
  }
  pickDown() {
    if (!this.feature) return;
    this.feature.removeEvent();
  }
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

