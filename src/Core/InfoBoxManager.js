import EventHelper from './EventHelper';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import defined from 'cesium/Core/defined';
import InfoBox from './InfoBox';
import createGuid from 'cesium/Core/createGuid';
class InfoBoxManager {
  constructor({
    close = () => {},
    open = () => {},
    trigger = 'LEFT_CLICK',
    single = true,
    follow = false,
    icons = [],
    id,
    valid,
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
    this.validType = valid.validType;
    // 获取对比点击对象中的深度属性，先进行按.分割
    this.validProps = valid.validProps.split('.');
    // 获取点击实体对象的属性名
    this.propsObject = props;
    // 劫持对象的字段
    this.observeKeys = [].concat(keys);
    // 创建标牌的icons的name,和相对应的点击事件
    this.icons = [].concat(icons);
    // 关闭标牌按钮的处理事件
    this.closeHandler = close;
    // 打开标牌触发的处理事件
    this.openHandler = open;
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
  _initInfoBox(pickedFeature) {
    // 1.如果是独立模式的话那么只有第一次进来会创建
    if (this.single && this.infobox instanceof InfoBox) return this.infobox;
    // 由于点击到的可能是primitives, 可能存在没有id的情况,默认id为''
    let id = pickedFeature.id;
    // 如果该标牌已经存在了,那么就获取该infobox
    if (InfoBox.isExist(id)) return this.getInfoBoxById(id);
    // 否则的话创建一个infobox
    let infobox = new InfoBox(id, this.observeKeys, this.icons);
    // 将infobox与点击的实体绑定
    if (this.follow) infobox.bindEntity(pickedFeature);
    // 为其标牌添加关闭事件
    infobox.closeEventListener(this.closeHandler);
    // 为其添加打开事件
    infobox.openEventListener(this.openHandler);
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
   * 深度迭代用户传入的多个属性
   * @Author   MJC
   * @DateTime 2018-12-25
   * @version  1.0.0
   * @param    {[type]}   pickedFeature [description]
   * @return   {[type]}                 [description]
   */
  depthIterator(pickedFeature) {
    // length === 1,分为'' 或者 'xxx'
    if (this.validProps.length === 1) {
      // 如果不为空，就代表1级属性,如Obj[key]
      if (this.validProps[0] !== '') {
        return pickedFeature[this.validProps[0]];
      } else {
        return pickedFeature;
      }
    } else {
      // 由于可能判断的是对象深度属性，需要reduce以下
      return this.validProps.reduce(function(pre, cur) {
        if (pickedFeature[pre]) return pickedFeature[pre][cur];
      }, pickedFeature);
    }
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

      pickedFeature = self.depthIterator(pickedFeature);
      // 如果pick的不是预先传入的类型就直接返回
      if (!(pickedFeature instanceof self.validType)) return;

      if (!pickedFeature.id) pickedFeature.id = createGuid();
      // 初始化标牌
      let infobox = self._initInfoBox(pickedFeature);

      // 根据方法或者字段名设置显示的infobox的内容
      infobox.setFeature(function(key) {
        let value;
        if (typeof pickedFeature[self.propsObject] === 'object') {
          value = pickedFeature[self.propsObject][key];
        } else {
          value = pickedFeature[self.propsObject](key);
        }
        if (key === 'id' && value) return value.toString().substring(0, 8);
        return value;
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
    if (!Array.isArray(this.infobox) && this.infobox.id === id) return this.infobox;
    // 否则需要从多模式下数组遍历出需要的infobox
    return this.infobox.filter(val => {
      return val.id === id;
    })[0];
  }

}

export default InfoBoxManager;
