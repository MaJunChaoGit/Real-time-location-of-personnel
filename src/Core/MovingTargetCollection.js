import CustomDataSource from 'cesium/DataSources/CustomDataSource';
import defined from 'cesium/Core/defined';
import JulianDate from 'cesium/Core/JulianDate';
import Cartesian2 from 'cesium/Core/Cartesian2';
import InfoBox from 'source/Core/InfoBox';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import EventHelper from 'source/Core/EventHelper';
import Cesium3DTileFeature from 'cesium/Scene/Cesium3DTileFeature';

/**
 * 该类为动目标管理类，主要功能为
 * 1.统一存放一组动目标
 * 2.统一进行删除，显示隐藏操作
 * 3.通过id索引出具体动目标
 */
class MovingTargetCollection {
  constructor(viewer) {
    // 必须传入viewer对象
    if (!defined(viewer)) {
      throw new Error('需要viewer对象');
    }
    this._viewer = viewer;
    this.targetCollection = [];
    this.postUpdate = () => {};
    this._dataSource = new CustomDataSource();
    this._viewer.dataSources.add(this._dataSource);
    this._clock = this._viewer.clock;
    this._entities = this._dataSource.entities;
    this._trackedEntity = {};
    this.resetPosition = {};
    this.event = {};
    this.registerEvent();
  }
  /**
   * 设置动画的播放速率
   * @param {Number} speed [动画播放速率]
   */
  setMutiplier(speed) {
    this._clock.multiplier = speed ? speed : 5;
  }
  /**
   * 添加实体进入动目标集合
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   * @param    {Entity}
   */
  add(target, isBind) {
    this.targetCollection.push(target);
    let entity = target.createEntity();
    if (this._entities.contains(entity)) return;
    let enty = this._entities.add(entity);
    if (isBind) this.bindWithInfobox(enty);
  }
  registerEvent() {
    this.event = new EventHelper(this._viewer);

    this.event.setEvent((movement) => {
      // 获取屏幕的坐标
      let screenPosition = movement.position;
      // 获取屏幕坐标点击后的实体
      let pickEntity = this._viewer.scene.pick(screenPosition);
      // 如果没有目标被选中则退出
      if (!pickEntity || pickEntity instanceof Cesium3DTileFeature) return;
      // 获取实体
      let entity = pickEntity.id;
      // 如果该目标没有标牌的话就创建标牌
      if (!document.querySelector('#' + entity.id)) {
        // 创建标牌等
        this.infobox = new InfoBox(entity.id, ['type', 'ascription']);
        this.infobox.setFeature((key) => {
          return entity.options[key];
        });
      }
      this.infobox.show(true);
    }, ScreenSpaceEventType.LEFT_CLICK);

    this.event.setEvent((movement) => {
      let screenPosition = movement.position;
      let pickEntity = this._viewer.scene.pick(screenPosition);
      if (!pickEntity || pickEntity instanceof Cesium3DTileFeature) return;
      let entity = this._trackedEntity[pickEntity.id.id];
      if (entity) {
        if (this.resetPosition) this._viewer.camera.updateCamera(this.resetPosition);
        this._viewer.trackedEntity = undefined;
        delete this._trackedEntity[pickEntity.id.id];
      } else {
        this._viewer.trackedEntity = pickEntity.id;
        this._trackedEntity[pickEntity.id.id] = pickEntity.id;
        this.resetPosition = this._viewer.camera.setOptions();
      }
    }, ScreenSpaceEventType.RIGHT_CLICK);
  }
  /**
   * 在添加完实体后就绑定其标牌一起运动
   * @Author   MJC
   * @DateTime 2018-10-11
   * @version  1.0.0
   * @param    {Object}   entity 实体对象
   */
  bindWithInfobox(entity) {
    let that = this;
    let scratch = new Cartesian2();

    // 绑定预渲染事件
    this.postUpdate = function() {
      if (!entity) return;
      let time = that._clock._currentTime;
      let position = entity.position.getValue(time);
      let canvasPosition = that._viewer.scene.cartesianToCanvasCoordinates(position, scratch);

      if (position && canvasPosition) {
        InfoBox.setPosition(entity.id, canvasPosition);
        // let timeText = that.getTime(JulianDate.toDate(time));
        // 更新div文本中的位置时间信息
        // htmlOverlay.children[1].children[3].innerText = ('位置时间 : ' + timeText);
      } else {
        // 若位置点消耗完,则删除div
        document.getElementById(that.data.id).remove();
        // 移除绑定
        this._viewer.scene.postUpdate.removeEventListener(this.postUpdate);
      }
    };
    // 在场景中添加绑定
    this._viewer.scene.postUpdate.addEventListener(this.postUpdate);
  }
  /**
   * 根据实体的id删除实体
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   * @param    {String}
   */
  removeById(id) {
    return this._entities.removeById(id);
  }
  /**
   * 删除所有集合内的实体
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   */
  removeAll() {
    return this._entities.removeAll();
  }
  /**
   * 根据实体的id来控制显示隐藏
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   * @param    {String} 实体的ID
   * @param    {Boolean} 显示还是隐藏
   */
  visiableById(id, flag) {
    this._entities.getById(id).show = flag;
    return flag;
  }
  /**
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   * @param    {Boolean} 显示还是隐藏
   */
  visiableAll(flag) {
    this._dataSource.show = flag;
    return flag;
  }

  /**
   * 这里设置了动目标集合的生命周期时间，如果有第二个动目标集合的话，设置生命周期时以并集为主
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   * @param    {StringDate} start 整个MovingCollection的起始时间 e.g '2018-06-01 16:22:00'
   * @param    {StringDate} stop  整个MovingCollection的结束时间 e.g '2019-06-01 16:22:00'
   */
  setLifyCircle(start, stop) {
    if (!defined(start) && !defined(stop)) throw new Error('需要传入开始字符串,格式为yyyy-mm-dd hh:mm:ss');

    start = JulianDate.fromDate(new Date(start));
    stop = JulianDate.fromDate(new Date(stop));

    this._clock.shouldAnimate = true;
    this._clock.startTime = start.clone();
    this._clock.currentTime = start.clone();
    this._clock.endTime = stop.clone();
  }

  destroy() {

  }
};
export default MovingTargetCollection;