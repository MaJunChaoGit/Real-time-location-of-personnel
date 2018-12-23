import Math from 'cesium/Core/Math';

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
  constructor(id, props) {
    if (!id) throw new Error('需要传入infobox的ID');
    this.id = id;
    this.status;
    this.container = {};
    this.table = {};
    this.feature = {};
    this.props = props;
    this.observe();
  }
  /**
   * 对外调用的初始化HTML元素方法
   * @Author   MJC
   * @DateTime 2018-10-18
   * @version  1.0.0
   * @return
   */
  init() {
    this.container = this._initContainer();
    this.table = this._initTable();
    return this;
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
    // 添加关闭按钮点击事件
    document.querySelector('#infobox' + this.id + ' .rp-icon-close').addEventListener('click', (event) => {
      // 隐藏标牌
      this.show(false);
      callback(event);
    }, false);
  }
  /**
   * 点击小眼睛按钮时调用方法
   * @Author   MJC
   * @DateTime 2018-10-18
   * @version  1.0.0
   * @param    {Function} callback 点击按钮时回调函数
   * @return   {[type]}            [description]
   */
  focusEventListener(callback) {
    document.querySelector('#infobox' + this.id + ' .rp-icon-view').addEventListener('click', (event) => {
      callback(event);
    }, false);
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
    let table = document.createElement('table');
    table.setAttribute('class', 'rp-infobox__table');
    document.querySelector('#infobox' + this.id + ' .rp-infobox__container').appendChild(table);
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
    if (element) element.style.display = isShow ? 'block' : 'none';
    this.status = isShow ? 'open' : 'close';
  }
  /**
   * 对this.feature进行劫持
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  [version]
   * @param    {Object}   feature 需要劫持的对象
   */
  observe() {
    this.props.forEach(key => {
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
        return obj[prop];
      },
      set(newValue) {
        if (newValue !== value) {
          // 对设置的值进行格式化
          newValue = that.toFixed(prop, newValue);
          // 如果没有创建此行数据，那么对table进行插入此行数据操作
          if (!document.querySelector('#infobox' + that.id + ' .rp-infobox__container table #' + prop)) {
            let tr = document.createElement('tr');
            tr.setAttribute('id', prop);
            that.table.appendChild(tr);
            tr.innerHTML = '<th>' + prop + '</th><td>' + (newValue ? newValue : '暂无') + '</td>';
          } else {
            // 如果已经有这行数据，只进行更新
            document.querySelector('#infobox' + that.id + ' .rp-infobox__container table #' + prop + '> td').textContent = newValue ? newValue : '暂无';
          }
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
    if (prop === 'longitude' || prop === 'latitude') value = Math.toDegrees(Number(value)).toFixed(2);
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
  }
};

export default InfoBox;
