import CustomDataSource from 'cesium/DataSources/CustomDataSource';
import defined from 'cesium/Core/defined';
import JulianDate from 'cesium/Core/JulianDate';
import Cartesian2 from 'cesium/Core/Cartesian2';
import InfoBox from 'source/Core/InfoBox';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import EventHelper from 'source/Core/EventHelper';
import Cesium3DTileFeature from 'cesium/Scene/Cesium3DTileFeature';
import { crtTimeFtt } from 'ex/utils/dom';
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
    // 将该实体与该详情标牌关联
    this.bindWithInfobox();
  }
  /**
   * 设置动画的播放速率
   * @param {Number} speed [动画播放速率]
   */
  setMultiplier(speed) {
    this._clock.multiplier = speed ? speed : 5;
  }
  /**
   * 添加实体进入动目标集合
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   * @param    {Entity}
   */
  add(target) {
    // 将MovingTarget对象放入集合中方便后期管理
    this.targetCollection.push(target);
    // 创建实体对象
    let entity = target.createEntity();
    // 如果实体对象已经被创建那么返回
    if (this._entities.contains(entity)) return;
    // 将实体加入场景
    this._entities.add(entity);
  }
  /**
   * 根据id查找集合中的MovingTarget对象
   * @Author   MJC
   * @DateTime 2018-10-18
   * @version  1.0.0
   * @param    {String}         id target的ID
   * @return   {MovingTarget}      MovingTarget
   */
  getById(id) {
    return this.targetCollection.filter(val => {
      return val.id === id;
    })[0];
  }
  /**
   * 为动目标集合中的目标绑定左键与右键点击事件
   * @Author   MJC
   * @DateTime 2018-10-11
   * @version  1.0.0
   */
  registerEvent() {
    // 创建事件管理对象
    this.event = new EventHelper(this._viewer);

    // 设置左键点击处理函数
    this.event.setEvent((movement) => {
      // 获取屏幕的坐标
      let screenPosition = movement.position;
      // 获取屏幕坐标点击后的实体
      let pickEntity = this._viewer.scene.pick(screenPosition);
      // 如果没有目标被选中或者选中的是倾斜摄影则退出
      if (!pickEntity || (pickEntity && !pickEntity.id) || pickEntity instanceof Cesium3DTileFeature) return;
      // 获取实体
      let entity = pickEntity.id;
      // 如果该目标没有标牌的话就创建标牌
      if (!document.querySelector('#infobox' + entity.id)) {
        // 标牌获取
        let infobox = this.getById(entity.id).infobox;
        // 初始化标牌
        infobox.init();
        // 对标牌数据进行更新 todo 更新坐标或者位置时间
        infobox.setFeature((key) => {
          switch (key) {
            case 'id':
              return entity.options[key].substring(0, 8);
            default:
              return entity.options[key];
          }
        });
        // 为其标牌添加关闭事件
        infobox.closeEventListener(() => {
          // 隐藏航迹
          entity.path.show = false;
        });
      }
      // 点击时标牌进行显示
      this.getById(entity.id).infobox.show(true);
      // 显示航迹
      entity.path.show = true;
    }, ScreenSpaceEventType.LEFT_CLICK);
    // 设置右键点击处理函数
    this.event.setEvent((movement) => {
      // 获取屏幕的坐标
      let screenPosition = movement.position;
      // 获取屏幕坐标点击后的实体
      let pickEntity = this._viewer.scene.pick(screenPosition);
      // 如果没有目标被选中或者选中的是倾斜摄影则退出
      if (!pickEntity || (pickEntity && !pickEntity.id) || pickEntity instanceof Cesium3DTileFeature) return;
      // 获取下该实体是否被跟踪
      if (this.isTrack(pickEntity.id.id)) {
        // 如果被跟踪并且已经记录上次摄像机的位置时那么就取消跟踪并将摄像机位置重置至右键点击时位置
        if (this.resetPosition) this._viewer.camera.updateCamera(this.resetPosition);
        this.cancelTrack(pickEntity.id.id);
      } else {
        // 跟踪目标并记录右键点击时位置
        this.track(pickEntity.id);
        this.resetPosition = this._viewer.camera.setOptions();
      }
    }, ScreenSpaceEventType.RIGHT_CLICK);
  }
  /**
   * 判断实体目前是否跟踪状态
   * @Author   MJC
   * @DateTime 2018-10-11
   * @version  1.0.0
   * @param    {String}   id 实体对象的id
   * @return   {Boolean}     true 跟踪 false 不跟踪
   */
  isTrack(id) {
    return !!this._trackedEntity[id];
  }
  /**
   * 取消目标的跟踪状态
   * @Author   MJC
   * @DateTime 2018-10-11
   * @version  1.0.0
   * @param    {String}   id 取消跟踪目标
   */
  cancelTrack(id) {
    this._viewer.trackedEntity = undefined;
    delete this._trackedEntity[id];
  }
  /**
   * 跟踪当前传入的实体目标
   * @Author   MJC
   * @DateTime 2018-10-11
   * @version  1.0.0
   * @param    {Entity}   entity 跟踪的实体
   */
  track(entity) {
    this._viewer.trackedEntity = entity;
    this._trackedEntity[entity.id] = entity;
  }
  /**
   * 在添加完实体后就绑定其标牌一起运动
   * @Author   MJC
   * @DateTime 2018-10-11
   * @version  1.0.0
   * @param    {Object}   entity 实体对象
   */
  bindWithInfobox() {
    let that = this;
    let scratch = new Cartesian2();

    // 绑定预渲染事件
    this.postUpdate = function() {
      // 获取当前的朱丽叶时间
      let time = that._clock._currentTime;
      let collection = that._entities._entities._array;
      for (let i = 0; i < collection.length; i++) {
        let entity = collection[i];
        // 获取当前时间下该实体目标的笛卡尔坐标
        let position = entity.position.getValue(time);
        // 如果目标还存在时
        if (position) {
          // 获取实体目标屏幕坐标
          let canvasPosition = that._viewer.scene.cartesianToCanvasCoordinates(position, scratch);
          // 对其详情标牌的位置进行刷新
          InfoBox.setPosition(entity.id, canvasPosition);
          // 更新实体的位置时间
          let timeLabel = document.querySelector('#infobox' + entity.id + ' table>#time>td');
          let timeValue = crtTimeFtt(that._clock._currentTime);
          if (timeLabel) timeLabel.textContent = timeValue;
          entity.options.time = timeValue;
        };
        if (JulianDate.compare(time, entity._availability._intervals[0].stop) > 0) {
          // 删除详情标牌
          let container = document.getElementById('infobox' + entity.id);
          if (container) container.remove();
          // 取消目标的跟踪
          that.cancelTrack(entity.id);
          // 移除目标
          that.removeById(entity.id);
        }
      }
      // 移除目标的预渲染处理事件
      if (JulianDate.compare(time, that.stop) > 0) that._viewer.scene.postUpdate.removeEventListener(that.postUpdate);
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
    this.start = JulianDate.fromDate(new Date(start));
    this.stop = JulianDate.fromDate(new Date(stop));
    this._clock.shouldAnimate = true;
    this._clock.startTime = this.start.clone();
    this._clock.currentTime = this.start.clone();
    this._clock.endTime = this.stop.clone();
  }

  destroy() {

  }
};
export default MovingTargetCollection;
