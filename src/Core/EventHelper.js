import ScreenSpaceEventHandler from 'cesium/Core/ScreenSpaceEventHandler';

/**
 * [EventHelper description]
 * 事件管理类
 * @Author   Mjc
 * @DateTime 2018-04-19T15:22:05+0800
 * @exports
 * @param    {Object}  viewer 场景对象
 * @return
 */
class EventHelper {
  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
  }
  /**
   * 设置监听的事件和处理函数
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {Function} callback 事件的处理函数
   * @param    {ScreenSpaceEventType}   eventType 需要监听的事件类型
   */
  setEvent(callback, eventType) {
    this.handler.setInputAction(callback, eventType);
  }
  /**
   * 根据类型获取监听的事件
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {ScreenSpaceEventType}   eventType 监听的事件类型
   * @return   {ScreenSpaceEvent}       具体的事件对象
   */
  getEvent(eventType) {
    return this.viewer.screenSpaceEventHandler.getInputAction(eventType);
  }

  /**
   * 销毁处理的事件函数
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {ScreenSpaceEventType}   eventType 需要被销毁的事件类型
   * @return   {Null}
   */
  destory(eventType) {
    if (!eventType) {
      this.handler = this.handler && this.handler.destory();
      return;
    }
    this.handler.removeInputAction(eventType);
  }
}

export default EventHelper;
