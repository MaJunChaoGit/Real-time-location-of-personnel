import CustomDataSource from 'cesium/DataSources/CustomDataSource';
import defined from 'cesium/Core/defined';
import JulianDate from 'cesium/Core/JulianDate';
import MovingTarget from './MovingTarget';
import InfoBoxManager from './InfoBoxManager';
/**
 * 该类为动目标管理类，主要功能为
 * 1.统一存放一组动目标
 * 2.统一进行删除，显示隐藏操作
 * 3.通过id索引出具体动目标
 */
let info = null;
const dataSourceCollection = []; // 保存所有MovingTargetCollection的大集合
class MovingTargetCollection {
  constructor(viewer) {
    // 必须传入viewer对象
    if (!defined(viewer)) {
      throw new Error('需要viewer对象');
    }
    this._viewer = viewer;
    this.targetCollection = [];
    this._dataSource = new CustomDataSource();
    this._viewer.dataSources.add(this._dataSource);
    this._clock = this._viewer.clock;
    this._entities = this._dataSource.entities;
    this._trackedEntity = {};
    this.resetPosition = {};

    dataSourceCollection.push(this);
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
    // let entity = target.createEntity();
    // 如果实体对象已经被创建那么返回
    if (this._entities.contains(target)) return;
    // 将实体加入场景
    this._entities.add(target);
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
   * 由于优化动目标的监听事件,将多个事件转为单个事件委托的模式
   * 所以需要保存dataSourceCollection,并且通过实体id获取父类
   * @Author   MJC
   * @DateTime 2018-12-23
   * @version  1.0.0
   * @param    {String}   id 集合中动目标的id
   * @return   {MovingTargetCollection}      该类的实例
   */
  static getCurrentCollection(id) {
    for (let i = 0; i < dataSourceCollection.length; i++) {
      if (dataSourceCollection[i].getById(id)) {
        return dataSourceCollection[i];
      }
    }
  }
  /**
   * 为动目标集合中的目标绑定左键与右键点击事件
   * @Author   MJC
   * @DateTime 2018-10-11
   * @version  1.0.0
   */
  static registerLeftClickEvent() {
    info = new InfoBoxManager({
      id: 'MovingTarget',
      valid: {
        validProps: 'id',
        validType: MovingTarget
      },
      props: 'options',
      keys: ['id', 'phone', 'type', 'ascriptions', 'time'],
      icons: [{
        name: 'rp-icon-view',
        callback: () => {

        }
      }],
      close: (entity) => {
        entity.path.show = false;
      },
      open: (entity) => {
        entity.path.show = true;
      },
      single: false,
      follow: true
    });
    // // 创建事件管理对象
    // let event = new EventHelper(global.viewer);

    // // 设置左键点击处理函数
    // event.setEvent((movement) => {
    //   // 获取屏幕的坐标
    //   let screenPosition = movement.position;
    //   // 获取屏幕坐标点击后的实体
    //   let pickEntity = global.viewer.scene.pick(screenPosition);
    //   // 如果没有目标被选中或者选中的是倾斜摄影则退出
    //   if (!pickEntity || (pickEntity && !pickEntity.id) || pickEntity instanceof Cesium3DTileFeature) return;

    //   console.log(pickEntity instanceof MovingTarget);
    //   // 获取实体
    //   let entity = pickEntity.id;
    //   // 获取当前实体所属的动目标集合
    //   // let self = MovingTargetCollection.getCurrentCollection(entity.id);
    //   // 如果该目标没有标牌的话就创建标牌
    //   // if (!document.querySelector('#infobox' + entity.id)) {
    //     // 标牌获取
    //     // let infobox = self.getById(entity.id).infobox;
    //     // // 初始化标牌
    //     // infobox.init();
    //     // // 对标牌数据进行更新 todo 更新坐标或者位置时间
    //     // infobox.setFeature((key) => {
    //     //   switch (key) {
    //     //     case 'id':
    //     //       return entity.options[key].substring(0, 8);
    //     //     default:
    //     //       return entity.options[key];
    //     //   }
    //     // });
    //     // 为其标牌添加关闭事件
    //     // infobox.closeEventListener(() => {
    //     //   infobox.show(false);
    //     //   // 隐藏航迹
    //     //   entity.path.show = false;
    //     // });
    //     // 点击小眼睛按钮触发跟踪实体, 并修改按钮颜色
    //     // infobox.focusEventListener((event) => {
    //     //   let target = event.target;
    //     //   let isTrack = self.trackEntity(entity, {
    //     //     callback: () => {
    //     //       document.querySelectorAll('.rp-icon-view').forEach(val => {
    //     //         val.style.color = 'white';
    //     //       });
    //     //     }
    //     //   });
    //     //   isTrack ? target.style.color = 'yellow' : target.style.color = 'rgba(255, 255, 255, 1)';
    //     // });
    //   // }
    //   // 点击时标牌进行显示
    //   // self.getById(entity.id).infobox.show(true);
    //   // 显示航迹
    //   // entity.path.show = !entity.path.show;
    // }, ScreenSpaceEventType.LEFT_CLICK);
    // // 设置右键点击处理函数
    // this.event.setEvent((movement) => {
    //   // 获取屏幕的坐标
    //   let screenPosition = movement.position;
    //   // 获取屏幕坐标点击后的实体
    //   let pickEntity = this._viewer.scene.pick(screenPosition);
    //   // 如果没有目标被选中或者选中的是倾斜摄影则退出
    //   if (!pickEntity || (pickEntity && !pickEntity.id) || pickEntity instanceof Cesium3DTileFeature) return;
    //   // 跟踪实体的方法
    //   this.trackEntity(pickEntity.id);
    // }, ScreenSpaceEventType.RIGHT_CLICK);
  }
  /**
   * 跟踪或者取消跟踪实体的方法
   * @Author   MJC
   * @DateTime 2018-10-21
   * @version  1.0.0
   * @param    {Entity}   entity 实体对象
   */
  trackEntity(entity, { callback = () => {}, cancel = () => {}}) {
    // 获取下该实体是否被跟踪
    if (this.isTrack(entity.id)) {
      // 如果被跟踪并且已经记录上次摄像机的位置时那么就取消跟踪并将摄像机位置重置至右键点击时位置
      if (this.resetPosition) this._viewer.camera.updateCamera(this.resetPosition);
      // 取消追踪方法
      this.cancelTrack();
      cancel();
      return false;
    } else {
      // 跟踪目标并记录右键点击时位置
      this.track(entity);
      // 记录上次的摄像机位置
      this.resetPosition = this._viewer.camera.setOptions();
      callback();
      return true;
    }
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
    if (this._trackedEntity) return this._trackedEntity.id === id;
    return false;
  }
  /**
   * 取消目标的跟踪状态
   * @Author   MJC
   * @DateTime 2018-10-11
   * @version  1.0.0
   * @param    {String}   id 取消跟踪目标
   */
  cancelTrack() {
    this._viewer.trackedEntity = undefined;
    this._trackedEntity = null;
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
    this._trackedEntity = entity;
  }
  /**
   * 在添加完实体后就绑定其标牌一起运动
   * @Author   MJC
   * @DateTime 2018-10-11
   * @version  1.0.0
   * @param    {Object}   entity 实体对象
   */
  static bindWithInfobox() {
    // 绑定预渲染事件
    let postUpdate = function() {
      // 获取当前的朱丽叶时间
      let time = global.viewer.clock._currentTime;
      // 遍历所有创建的总体动目标集合
      for (let i = 0; i < dataSourceCollection.length; i++) {
        // 获取其中一个动目标集合, 该对象为本类的实例
        let movingTargetCollection = dataSourceCollection[i];
        // 获取其中存放所有实体动目标的集合
        let dataSource = movingTargetCollection._entities._entities._array;
        // 遍历这个集合
        dataSource.forEach(entity => {
          // 比较一下,如果当前时间超过了实体最大显示时间,那么就删除标牌
          if (entity._availability._intervals[0] && JulianDate.compare(time, entity._availability._intervals[0].stop) > 0) {
            // 删除详情标牌
            let container = document.getElementById('infobox' + entity.id);
            if (container) container.remove();
            // 取消目标的跟踪
            movingTargetCollection.cancelTrack();
            // 移除目标
            movingTargetCollection.removeById(entity.id);
          }
        });
      }
      // 如果当前时间超过了时钟设置的总的结束时间, 移除目标的预渲染处理事件
      if (JulianDate.compare(time, global.viewer.clock.endTime) > 0) global.viewer.scene.postUpdate.removeEventListener(postUpdate);
    };
    // 在场景中添加绑定
    global.viewer.scene.postUpdate.addEventListener(postUpdate);
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

  destroy() {

  }
};
export default MovingTargetCollection;
