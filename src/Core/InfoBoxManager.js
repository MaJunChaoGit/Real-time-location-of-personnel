import EventHelper from './EventHelper';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import defined from 'cesium/Core/defined';
import InfoBox from './InfoBox';
import createGuid from 'cesium/Core/createGuid';
let tempInfo = [];
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
   * 控制标牌显示隐藏
   * @Author   MJC
   * @DateTime 2018-12-27
   * @version  1.0.0
   * @param    {[type]}   flag [description]
   * @return   {[type]}        [description]
   */
  visiable(flag) {
    // 如果是隐藏的话,需要将所有小黄标改为白色
    if (!flag) {
      document.querySelectorAll('.rp-icon-view').forEach(val => {
        val.style.color = 'white';
      });
    }
    // 如果是多目标控制的话
    if (Array.isArray(this.infobox)) {
      // 如果是需要隐藏的话,需要将所有当前状态为close的infobox的id保存
      this.infobox.forEach(info => {
        if (!flag && info.status === 'close') tempInfo.push(info.id);
      });
      // 遍历的时候,如果是要重新打开infobox时,需要只打开之前显示的标牌,其他隐藏的继续隐藏
      this.infobox.forEach(info => {
        if (flag && tempInfo.indexOf(info.id) === -1) info.show(flag);
        if (!flag) info.show(flag);
      });
    } else {
      this.infobox.show(flag);
    }
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

    let model = {
      single: this.single,
      follow: this.follow,
      first: !(this.infobox instanceof InfoBox)
    };
    // 由于点击到的可能是primitives, 可能存在没有id的情况,默认id为''
    let id = pickedFeature.id;
    // 独立模式
    if (model.single) {
      if (model.first) {
        // 新建一个infobox
        let infobox = new InfoBox(id, this.observeKeys, this.icons);
        // 为其标牌添加关闭事件
        infobox.closeEventListener(this.closeHandler);
        // 为其添加打开事件
        infobox.openEventListener(this.openHandler);
        // 设置标牌的实体
        infobox.setEntity(pickedFeature);
        // 如果是follow模式
        // 将infobox与点击的实体绑定
        if (this.follow) infobox.bindEntity(pickedFeature);
        // 给实例装上该infobox
        this.infobox = infobox;
        return infobox;
      } else {
        // 设置标牌的实体
        this.infobox.setEntity(pickedFeature);
        // 直接赋值
        return this.infobox;
      }
    } else {
      // 如果该标牌已经存在了,那么就获取该infobox
      if (InfoBox.isExist(id)) return this.getInfoBoxById(id);
      // 否则的话创建一个infobox
      let infobox = new InfoBox(id, this.observeKeys, this.icons);
      // 设置标牌的实体
      infobox.setEntity(pickedFeature);
      // 为其标牌添加关闭事件
      infobox.closeEventListener(this.closeHandler);
      // 为其添加打开事件
      infobox.openEventListener(this.openHandler);
      // 将infobox与点击的实体绑定
      if (this.follow) infobox.bindEntity(pickedFeature);
      // 给实例添加infbox
      this.infobox.push(infobox);

      return infobox;
    }
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
        if (key === 'id' && value) return value.toString().substring(0, 4);
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
