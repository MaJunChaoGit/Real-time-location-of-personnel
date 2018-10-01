import NameOverlay from 'source/Core/NameOverlay';
import EventHelper from 'source/Core/EventHelper';
import InfoBox from 'source/Core/InfoBox';
import defined from 'cesium/Core/defined';
import Color from 'cesium/Core/Color';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import Entity from 'cesium/DataSources/Entity';
let self = {};

class PickedFeature {
  constructor(viewer) {
    self = this;
    this.viewer = viewer;
    this.highlighted = {
      feature: undefined,
      originalColor: new Color()
    };
    this.selected = {
      feature: undefined,
      originalColor: new Color()
    };
    this.infoBox = new InfoBox(document.querySelector('.rp-infobox__container'));
    window.info = this.infoBox;
    this.selectedEntity = new Entity();
    this.nameOverlay = new NameOverlay('rp-nameOverlay', global.viewer);
    this.eventHelper = new EventHelper(global.viewer);
    this._initEvent();

  }
  _initEvent() {
    this.eventHelper.setEvent(this.onMoveEvent, ScreenSpaceEventType.MOUSE_MOVE);
    this.eventHelper.setEvent(this.onLeftClick, ScreenSpaceEventType.LEFT_CLICK);
  }
  removeEvent() {
    this.eventHelper.destory(ScreenSpaceEventType.MOUSE_MOVE);
    this.eventHelper.destory(ScreenSpaceEventType.LEFT_CLICK);
  }
  destory() {
    this.eventHelper.destory();
  }
  onMoveEvent(movement) {
    // 如果选中的要素之前已经被高亮,那么取消其高亮
    if (defined(self.highlighted.feature)) {
      self.highlighted.feature.color = self.highlighted.originalColor;
      self.highlighted.feature = undefined;
    }

    let pickedFeature = self.viewer.scene.pick(movement.endPosition);
    if (!defined(pickedFeature)) {
      self.nameOverlay.show(false);
      return;
    }
    self.nameOverlay.show(true);
    self.nameOverlay.setPostion(movement);

    let name = pickedFeature.getProperty('name');
    if (!defined(name)) {
      name = pickedFeature.getProperty('id');
    }
    self.nameOverlay.text(name);

    if (pickedFeature !== self.selected.feature) {
      self.highlighted.feature = pickedFeature;
      Color.clone(pickedFeature.color, self.highlighted.originalColor);
      pickedFeature.color = Color.RED.withAlpha(1.0);
    }
  }
  onLeftClick(movement) {
    if (defined(self.selected.feature)) {
      self.selected.feature.color = self.selected.originalColor;
      self.selected.feature = undefined;
    }

    let pickedFeature = self.viewer.scene.pick(movement.position);
    if (!defined(pickedFeature)) {
      self.eventHelper.getEvent(ScreenSpaceEventType.LEFT_CLICK)(movement);
      return;
    }

    if (self.selected.feature === pickedFeature) {
      return;
    }

    self.selected.feature = pickedFeature;

    if (pickedFeature === self.highlighted.feature) {
      Color.clone(self.highlighted.originalColor, self.selected.originalColor);
      self.highlighted.feature = undefined;
    } else {
      Color.clone(pickedFeature.color, self.selected.originalColor);
    }

    pickedFeature.color = Color.LIME;

    self.infoBox.setFeature(pickedFeature, pickedFeature.getPropertyNames());
    self.infoBox.show(true);
  }
}
export default PickedFeature;