import NameOverlay from './NameOverlay';
import EventHelper from 'source/Core/EventHelper';
import InfoBox from './InfoBox';
import defined from 'cesium/Core/defined';
import Color from 'cesium/Core/Color';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import Entity from 'cesium/DataSources/Entity';
import Cesium3DTileFeature from 'cesium/Scene/Cesium3DTileFeature';
let self = {};

class PickedFeature {
  /**
   * 操作倾斜摄影类
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {Viewer}   viewer 视图对象
   */
  constructor(viewer) {
    self = this;
    this.viewer = viewer;
    // 高亮数据模型
    this.highlighted = {
      feature: undefined,
      originalColor: new Color()
    };
    // 选中的数据模型
    this.selected = {
      feature: undefined,
      originalColor: new Color()
    };
    // 新建infobox对象
    this.infoBox = new InfoBox(document.querySelector('.rp-infobox__container'));
    // 新建标牌对象
    this.nameOverlay = new NameOverlay('rp-nameOverlay', global.viewer);
    // 新建事件管理类
    this.eventHelper = new EventHelper(global.viewer);
    // 初始化事件
    this.initEvent();

  }
  /**
   * 初始化鼠标移动事件，鼠标左键点击事件
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   */
  initEvent() {
    // 初始化鼠标移动事件，鼠标左键点击事件
    this.eventHelper.setEvent(this.onMoveEvent, ScreenSpaceEventType.MOUSE_MOVE);
    this.eventHelper.setEvent(this.onLeftClick, ScreenSpaceEventType.LEFT_CLICK);
  }
  /**
   * 移除鼠标移动事件，鼠标左键点击事件
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   */
  removeEvent() {
    // 移除鼠标移动事件，鼠标左键点击事件
    this.eventHelper.destory(ScreenSpaceEventType.MOUSE_MOVE);
    this.eventHelper.destory(ScreenSpaceEventType.LEFT_CLICK);
    // 恢复初始颜色

    if (this.highlighted.feature) this.highlighted.feature.color = this.highlighted.originalColor;
    if (this.selected.feature) this.selected.feature.color = this.selected.originalColor;
    this.infoBox.show(false);
    this.nameOverlay.show(false);
  }
  /**
   * 移除当前类的监听事件
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   */
  destory() {
    // 移除当前类的监听事件
    this.eventHelper.destory();
  }
  /**
   * 鼠标移动事件处理函数
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {Object}   movement 鼠标移动事件对象
   */
  onMoveEvent(movement) {
    // 如果选中的要素之前已经被高亮,那么取消其高亮
    if (defined(self.highlighted.feature)) {
      self.highlighted.feature.color = self.highlighted.originalColor;
      self.highlighted.feature = undefined;
    }
    // 根据鼠标位置获取选中的3dTiles要素
    let pickedFeature = self.viewer.scene.pick(movement.endPosition);
    // 如果没有选中任何要素
    if (!defined(pickedFeature)) {
      // 隐藏子标牌
      self.nameOverlay.show(false);
      return;
    }
    // 如果pick的不是3dTile就返回
    if (!(pickedFeature instanceof Cesium3DTileFeature)) return;
    // 显示子标牌
    self.nameOverlay.show(true);
    // 根据鼠标位置定位子标牌
    self.nameOverlay.setPostion(movement);
    // 获取Property的name
    let name = pickedFeature.getProperty('name');
    // 如果没有定义name的话就用id设置
    if (!defined(name)) {
      name = pickedFeature.getProperty('id');
    }
    // 设置子标牌的显示内容
    self.nameOverlay.text(name);
    // 如果鼠标移动选中的要素建筑不是单击选中的要素
    if (pickedFeature !== self.selected.feature) {
      // 将当前的要素存在高亮数据模型中
      self.highlighted.feature = pickedFeature;
      // 记录pickedFeature.color的原始颜色
      Color.clone(pickedFeature.color, self.highlighted.originalColor);
      // 修改被悬浮要素的颜色
      pickedFeature.color = Color.RED.withAlpha(1.0);
    }
  }
  /**
   * 鼠标点击事件处理函数
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {Object}   movement 鼠标移动事件对象
   */
  onLeftClick(movement) {
    // 如果已经有高亮的要素了，取消其高亮
    if (defined(self.selected.feature)) {
      self.selected.feature.color = self.selected.originalColor;
      self.selected.feature = undefined;
    }
    // 根据鼠标位置获取选中的3dTiles要素
    let pickedFeature = self.viewer.scene.pick(movement.position);
    // 如果pick的不是3dTile就返回
    if (!(pickedFeature instanceof Cesium3DTileFeature)) return;
    // 如果没有选中任何要素
    if (!defined(pickedFeature)) {
      // 重新触发点击事件
      self.eventHelper.getEvent(ScreenSpaceEventType.LEFT_CLICK)(movement);
      return;
    }
    // 如果重复选择当前目标的话,返回
    if (self.selected.feature === pickedFeature) {
      return;
    }
    // 记录高亮目标
    self.selected.feature = pickedFeature;
    // 如果高亮的目标和单击的目标是同一个, 取消其高亮效果
    if (pickedFeature === self.highlighted.feature) {
      Color.clone(self.highlighted.originalColor, self.selected.originalColor);
      self.highlighted.feature = undefined;
    } else {
      // 否则记录选中要素原来的颜色
      Color.clone(pickedFeature.color, self.selected.originalColor);
    }
    // 修改pickBUG
    // 修改要素颜色
    pickedFeature.color = Color.LIME;
    // 设置显示的infobox的内容
    self.infoBox.setFeature(pickedFeature, pickedFeature.getPropertyNames());
    // 显示infobox
    self.infoBox.show(true);
  }
}
export default PickedFeature;
