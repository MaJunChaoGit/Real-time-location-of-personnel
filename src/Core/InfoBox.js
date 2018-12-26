import Math from 'cesium/Core/Math';
import Cartesian2 from 'cesium/Core/Cartesian2';
import { crtTimeFtt } from 'ex/utils/dom';
class InfoBox {
  /**
   * 在用户调用了setFeature方法后会触发this.feature的响应式
   * this.feature中的字段赋值会根据是否存在直接改动table的显示的值
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {[type]}   container [description]
   * @return   {[type]}             [description]
   */
  constructor(id, keys, icons = []) {
    if (!id) throw new Error('需要传入infobox的ID');
    this.id = id;
    this.status = 'pending';
    this.container = {};
    this.icons = icons;
    this.table = {};
    this.feature = {};
    this.keys = keys;
    this.init();
  }
  /**
   * 设置标牌的实体
   * @Author   MJC
   * @DateTime 2018-12-26
   * @version  1.0.0
   * @param    {[type]}   entity [description]
   */
  setEntity(entity) {
    this.entity = entity;
  }
  /**
   * 对外调用的初始化HTML元素方法
   * @Author   MJC
   * @DateTime 2018-10-18
   * @version  1.0.0
   * @return
   */
  init() {
    // 先劫持所有的数据
    this.observe();
    // 初始化容器
    this.container = this._initContainer();
    // 初始化表格
    this.table = this._initTable();
    // 初始化icons
    this._iconsEventListener();
    return this;
  }
  /**
   * 绑定下实体，方便之后操作
   * @Author   MJC
   * @DateTime 2018-12-25
   * @version  1.0.0
   * @param    {Entity}   entity 绑定的实体
   * @return   {[type]}          [description]
   */
  bindEntity(entity) {
    let self = this;
    this.entity = entity;
    let scratch = new Cartesian2();
    // 绑定预渲染事件
    let postUpdate = function() {
      // 获取当前的朱丽叶时间
      let time = global.viewer.clock._currentTime;
      // 如果创建了标牌,并且标牌为打开状态
      if (self.status === 'open') {
        // 获取当前时间下该实体目标的笛卡尔坐标
        let position = entity.position.getValue(time);
        // 如果目标还存在时
        if (position) {
          // 获取实体目标屏幕坐标
          let canvasPosition = global.viewer.scene.cartesianToCanvasCoordinates(position, scratch);
          // 对其详情标牌的位置进行刷新
          InfoBox.setPosition(entity.id, canvasPosition);
          // 更新实体的位置时间
          let timeValue = crtTimeFtt(time);
          entity.options.time = timeValue;
          let timeLabel = document.querySelector('#infobox' + entity.id + ' table>#time>td');
          if (timeLabel) timeLabel.textContent = timeValue;
        }
      }
      // 如果当前时间超过了时钟设置的总的结束时间, 移除目标的预渲染处理事件
      if (!InfoBox.isExist(entity.id)) global.viewer.scene.postUpdate.removeEventListener(postUpdate);
    };
    // 在场景中添加绑定
    global.viewer.scene.postUpdate.addEventListener(postUpdate);
  }
  /**
   * 点击关闭按钮时调用方法
   * @Author   MJC
   * @DateTime 2018-10-18
   * @version  1.0.0
   * @param    {Function} callback 关闭按钮时回调函数
   * @return   {[type]}            [description]
   */
  closeEventListener(callback) {
    this.closeHandle = callback;
    // 添加关闭按钮点击事件
    document.querySelector('#infobox' + this.id + ' .rp-icon-close').addEventListener('click', (event) => {
      // 隐藏标牌
      this.show(false);
      callback(this.entity, event);
    }, false);
  }
  /**
   * 打开标牌触发的事件
   * @Author   MJC
   * @DateTime 2018-12-25
   * @version  1.0.0
   * @param    {Function} callback [description]
   * @return   {[type]}            [description]
   */
  openEventListener(callback) {
    this.openHandle = callback;
  }
  /**
   * 点击小眼睛按钮时调用方法
   * @Author   MJC
   * @DateTime 2018-10-18
   * @version  1.0.0
   * @param    {Function} callback 点击按钮时回调函数
   * @return   {[type]}            [description]
   */
  _iconsEventListener() {
    this.icons.forEach(icon => {
      this._initIcon(icon.name);
      document.querySelector('#infobox' + this.id + ' .' + icon.name).addEventListener('click', (event) => {
        icon.callback(this.entity, event);
      }, false);
    });
  }
  /**
   * 初始化左上角小图标
   * @Author   MJC
   * @DateTime 2018-12-24
   * @version  1.0.0
   * @param    {String}   name 小图标的class名字
   */
  _initIcon(name) {
    let icon = document.createElement('i');
    icon.setAttribute('class', name);
    document.querySelector('#infobox' + this.id + ' .rp-infobox__header').prepend(icon);
  }
  /**
   * 初始化标牌的容器
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.1
   * @param    {String} 容器infobox组件的id
   */
  _initContainer() {
    let container = document.querySelector('.rp-infobox').cloneNode(true);
    container.setAttribute('id', 'infobox' + this.id);
    document.body.appendChild(container);
    return container;
  }
  /**
   * 初始化标牌的表格部分
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.1
   * @param    {String} 容器infobox组件的id
   */
  _initTable() {
    // 创建表格
    let table = document.createElement('table');
    table.setAttribute('class', 'rp-infobox__table');
    document.querySelector('#infobox' + this.id + ' .rp-infobox__container').appendChild(table);
    // 创建tr
    Object.keys(this.feature).forEach(prop => {
      if (!document.querySelector('#infobox' + this.id + ' .rp-infobox__container table #' + prop)) {
        let tr = document.createElement('tr');
        tr.setAttribute('id', prop);
        table.appendChild(tr);
        let tempProp = prop === 'longitude' ? 'lon' : prop === 'latitude' ? 'lat' : prop === 'ascriptions' ? 'sub' : prop;
        tr.innerHTML = '<th>' + tempProp + '</th><td>' + (this.feature[prop] ? this.feature[prop] : '暂无') + '</td>';
      }
    });
    return table;
  }
  /**
   * 控制infoBox的显示或者隐藏
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {Boolean}  isShow 控制infoBox的显示或者隐藏
   */
  show(isShow) {
    let element = document.querySelector('#infobox' + this.id);
    if (!element) return;
    if (isShow) {
      element.style.display = 'block';
      this.status = 'open';
      this.openHandle(this.entity);
    } else {
      element.style.display = 'none';
      this.status = 'close';
      this.closeHandle(this.entity);
    }
  }
  /**
   * 对this.feature进行劫持
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  [version]
   * @param    {Object}   feature 需要劫持的对象
   */
  observe() {
    this.keys.forEach(key => {
      this.feature[key] = '';
      this.defineReactive(this.feature, key, this.feature[key]);
    });
  }
  /**
   * 对外进行设置数据的方法
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {Object}   pickedFeature 鼠标单击选中的要素模型
   * @param    {Array}   names         需要监听的数据字段
   */
  setFeature(callback) {
    Object.keys(this.feature).forEach(key => {
      this.feature[key] = callback(key);
    });
  }

  /**
   * 响应式方法
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {Object}   obj   需要劫持的对象
   * @param    {String}   prop   需要劫持的字段
   * @param    {String}   value 需要被修改的值
   */
  defineReactive(obj, prop, value) {
    let that = this;
    Object.defineProperty(obj, prop, {
      enumerable: true,
      configurable: true,
      get() {
        return value;
      },
      set(newValue) {
        if (newValue !== value) {
          // 对设置的值进行格式化
          newValue = that.toFixed(prop, newValue);
          // 如果已经有这行数据，只进行更新
          document.querySelector('#infobox' + that.id + ' .rp-infobox__container table #' + prop + '> td').textContent = newValue ? newValue : '暂无';
          value = newValue;
          return true;
        }
      }
    });
  }
  /**
   * 对数据的显示格式进行格式化
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {String}   prop  属性名
   * @param    {String}   value 属性值
   * @return   {String}   value 转化后的属性值
   */
  toFixed(prop, value) {
    // 如果是经度或纬度的属性，那么转为度数显示并保留两位小数
    if (prop === 'longitude' || prop === 'latitude') value = Math.toDegrees(parseFloat(value)).toFixed(2);
    // 如果是高度或面积的的属性，那么只保留两位小数
    if (prop === 'height' || prop === 'area') value = value.toFixed(2);
    return value;
  }
  /**
   * 控制标牌的位置
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {Object}   movement 事件中的movement对象
   */
  static setPosition(id, canvasPosition) {
    if (!canvasPosition) return;
    let box = document.querySelector('#infobox' + id);
    if (!box) return;
    box.style.top = canvasPosition.y + 'px';
    box.style.left = canvasPosition.x + 'px';
    box.style.bottom = 'auto';
  }

  /**
   * 查询当前标牌是否存在
   * @Author   MJC
   * @DateTime 2018-12-24
   * @version  [1.0.0]
   * @param    {String}   id 标牌的id
   * @return   {Boolean}     是否存在, true or false
   */
  static isExist(id) {
    return !!document.querySelector('#infobox' + id);
  }
};

export default InfoBox;
