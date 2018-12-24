import EventHelper from './EventHelper';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import defined from 'cesium/Core/defined';
import InfoBox from './InfoBox';

class InfoBoxManager {
  constructor({
    close = () => {},
    trigger = 'LEFT_CLICK',
    single = true,
    follow = false,
    icons = [],
    id,
    type,
    props,
    keys
  }) {
    // 该管理类的id
    this.id = id;
    // 触发标牌的方式
    this.trigger = trigger;
    // 标牌是否跟随
    this.follow = follow;
    // 标牌是否为同一管理类中唯一性质
    this.single = single;
    // 监听对比点击对象的类型
    this.listenType = type;
    // 获取点击实体对象的属性名
    this.propsObject = props;
    // 劫持对象的字段
    this.observeKeys = [].concat(keys);
    // 创建标牌的icons的name,和相对应的点击事件
    this.icons = [].concat(icons);
    // 关闭标牌按钮的处理事件
    this.closeHandler = close;
    // 生成infobox对象便于管理
    this.infobox = this.single ? {} : [];
    // 创建事件管理对象
    this.eventHelper = new EventHelper(global.viewer);
    // 初始化标牌触发事件
    this.initTriggerEvent();
  }

  /**
   * 初始化标牌
   * 由于点击到的可能是primitives, 可能存在没有id的情况,默认id为''
   * @Author   MJC
   * @DateTime 2018-12-25
   * @version  1.0.0
   * @param    {String}   id 标牌id
   * @return   {InfoBox}     标牌实例对象
   */
  _initInfoBox(id = '') {
    // 由于点击到的可能是primitives, 可能存在没有id的情况,默认id为''
    // 如果该标牌已经存在了,那么就获取该infobox
    if (InfoBox.isExist(this.id + '_' + id)) return this.getInfoBoxById(id);
    // 否则的话创建一个infobox
    let infobox = new InfoBox(this.id + '_' + id, this.observeKeys, this.icons, this.follow);
    // 为其标牌添加关闭事件
    infobox.closeEventListener(this.closeHandler);
    // 如果是独立模式的话
    if (this.single) {
      // 只需要创建一个InfoBox就可以了
      this.infobox = infobox;
    } else {
      // 判断一下是否存在每次点击创建一次
      this.infobox.push(infobox);
    }
    return infobox;
  }

  /**
   * 初始化触发事件
   * @Author   MJC
   * @DateTime 2018-12-25
   * @version  1.0.0
   * @return   {[type]}   [description]
   */
  initTriggerEvent() {
    // 初始化触发事件控制函数
    this.eventHelper.setEvent(this._triggerHandle(), ScreenSpaceEventType[this.trigger]);
  }
  /**
   * 移除触发事件
   * @Author   MJC
   * @DateTime 2018-12-25
   * @version  1.0.0
   * @return   {[type]}   [description]
   */
  removeTriggerEvent() {
    this.eventHelper.destory(ScreenSpaceEventType[this.trigger]);
  }

  /**
   * 触发事件管理方法
   * @Author   MJC
   * @DateTime 2018-12-25
   * @version  1.0.0
   * @return   {[type]}   [description]
   */
  _triggerHandle() {

    let self = this;

    return function(movement) {
      // 获取点击的要素
      let pickedFeature = global.viewer.scene.pick(movement.position);

      // 如果没有选中任何要素
      if (!defined(pickedFeature)) {
        // 重新触发点击事件
        self.eventHelper.getEvent(ScreenSpaceEventType[self.trigger])(movement);
        return;
      }

      // 如果pick的不是预先传入的类型就直接返回
      if (!(pickedFeature instanceof self.listenType)) return;
      // 初始化标牌
      let infobox = self._initInfoBox(pickedFeature.id);

      // 根据方法或者字段名设置显示的infobox的内容
      infobox.setFeature(function(key) {
        if (typeof pickedFeature[self.propsObject] === 'object') {
          return pickedFeature[self.propsObject][key];
        } else {
          return pickedFeature[self.propsObject](key);
        }
      });
      // 显示infobox
      infobox.show(true);
    };
  }
  /**
   * 根据id获取infobox实例
   * @Author   MJC
   * @DateTime 2018-12-25
   * @version  1.0.0
   * @param    {[type]}   id [description]
   * @return   {[type]}      [description]
   */
  getInfoBoxById(id) {
    // 由于单例下的infobox不是数组,所以直接获取就好了
    if (!Array.isArray(this.infobox) && this.infobox.id === (this.id + '_' + id)) return this.infobox;
    // 否则需要验证一下
    return this.infobox.filter(val => {
      return val.id === id;
    })[0];
  }
}

export default InfoBoxManager;
