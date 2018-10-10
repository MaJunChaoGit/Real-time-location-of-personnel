import CustomDataSource from 'cesium/DataSources/CustomDataSource';
import defined from 'cesium/Core/defined';
import JulianDate from 'cesium/Core/JulianDate';
import createGuid from 'cesium/Core/createGuid';

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
    this._dataSource = new CustomDataSource();
    this._viewer.dataSources.add(this._dataSource);
    this._clock = this._viewer.clock;
    this._entities = this._dataSource.entities;
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
  add(target) {
    if (!this._entities.contains(target)) this._entities.add(target);
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
