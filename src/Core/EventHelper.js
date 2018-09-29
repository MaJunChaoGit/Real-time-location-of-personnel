import ScreenSpaceEventHandler from 'cesium/Core/ScreenSpaceEventHandler';

class EventHelper {
  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
  }

  setEvent(callback, eventType) {
    this.handler.screenSpaceEventHandler.setInputAction(callback, eventType);
  }

  getEvent(eventType) {
    return this.viewer.screenSpaceEventHandler.getInputAction(eventType);
  }

  destory(eventType) {
    if (!eventType) {
      this.handler = this.handler && this.handler.destory();
      return;
    }
    this.handler.removeInputAction(eventType);
  }
}

export default EventHelper;
