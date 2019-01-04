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
let infoBoxManager = null;
let postUpdate;
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
  static withInfobox() {
    infoBoxManager = new InfoBoxManager({
      id: 'MovingTarget',
      valid: {
        validProps: 'id',
        validType: MovingTarget
      },
      props: 'options',
      keys: ['id', 'phone', 'type', 'ascriptions', 'time'],
      icons: [{
        name: 'rp-icon-view',
        callback: (entity, event) => {
          let target = event.target;
          let isTrack = global.viewer.trackEntity(entity, {
            callback: () => {
              document.querySelectorAll('.rp-icon-view').forEach(val => {
                val.style.color = 'white';
              });
            }
          });
          isTrack ? target.style.color = 'yellow' : target.style.color = 'rgba(255, 255, 255, 1)';
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
    return infoBoxManager;
  }
  /**
   * 获取infoboxManager
   * @Author   MJC
   * @DateTime 2018-12-27
   * @version  1.0.0
   * @return   {[type]}   [description]
   */
  static getInfobox() {
    return infoBoxManager;
  }
  /**
   * 在添加完实体后就绑定其标牌一起运动
   * @Author   MJC
   * @DateTime 2018-10-11
   * @version  1.0.0
   * @param    {Object}   entity 实体对象
   */
  static bindEntityWithInfobox() {
    if (postUpdate) MovingTargetCollection.unbindEntityWithInfobox();
    // 绑定预渲染事件
    postUpdate = function() {
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
            global.viewer.cancelTrack();
            // 移除目标
            movingTargetCollection.removeById(entity.id);
          }
        });
      }
      // 如果当前时间超过了时钟设置的总的结束时间, 移除目标的预渲染处理事件
      if (JulianDate.compare(time, global.viewer.clock.endTime) > 0) MovingTargetCollection.unbindEntityWithInfobox();
    };
    // 在场景中添加绑定
    global.viewer.scene.postUpdate.addEventListener(postUpdate);
  }
  /**
   * 解除标牌绑定事件
   * @Author   MJC
   * @DateTime 2018-12-27
   * @version  1.0.0
   * @return   {[type]}   [description]
   */
  static unbindEntityWithInfobox() {
    global.viewer.scene.postUpdate.removeEventListener(postUpdate);
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
    // 取消目标的跟踪
    global.viewer.cancelTrack();
    // 实体全部隐藏
    this._dataSource.show = flag;
    return flag;
  }
  /**
   * @Author   MJC
   * @DateTime 2018-12-27
   * @version  1.0.0
   * @param    {Boolean}   flag 显示还是隐藏
   * @return   {[type]}        [description]
   */
  static visiableAllCollection(flag) {
    // 控制标牌隐藏
    MovingTargetCollection.getInfobox().visiable(flag);
    // 控制标牌绑定实体
    flag ? MovingTargetCollection.bindEntityWithInfobox() : MovingTargetCollection.unbindEntityWithInfobox();
    // 控制实体显示隐藏
    dataSourceCollection.forEach(dataSource => {
      dataSource.visiableAll(flag);
    });
    return flag;
  }
};
export default MovingTargetCollection;
