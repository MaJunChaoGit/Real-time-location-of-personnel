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
  constructor(container) {
    this.container = container;
    this.table = document.createElement('table');
    this.feature = {
      id: '',
      type: '',
      height: '',
      area: '',
      longitude: '',
      latitude: ''
    };
    this.observe(this.feature);
    this.createTable();
    this.defineInfoBoxReactive();
  }
  /**
   * 控制infoBox的显示或者隐藏
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {Boolean}  isShow 控制infoBox的显示或者隐藏
   */
  show(isShow) {
    document.querySelector('.rp-infobox').style.display = isShow ? 'block' : 'none';
  }
  /**
   * 对this.feature进行劫持
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  [version]
   * @param    {Object}   feature 需要劫持的对象
   */
  observe(feature) {
    Object.keys(feature).forEach(key => {
      this.defineReactive(feature, key, feature[key]);
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
  setFeature(pickedFeature, names) {
    names.forEach(name => {
      this.feature[name] = pickedFeature.getProperty(name);
    });
  }

  /**
   * 响应式方法
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {Object}   obj   需要劫持的对象
   * @param    {String}   key   需要劫持的字段
   * @param    {String}   value 需要被修改的值
   */
  defineReactive(obj, key, value) {
    let that = this;
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        return obj[key];
      },
      set(newValue) {
        if (newValue !== value) {
          value = newValue;
          that.infobox[key] = newValue;
        }
      }
    });
  }
  /**
   * 创建infobox的容器
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   */
  createTable() {
    this.table.setAttribute('class', 'rp-infobox__table');
    this.container.appendChild(this.table);
  }
  /**
   * 对infobox中的内容进行代理，当数据发生变化时自动更新table
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   */
  defineInfoBoxReactive() {
    let that = this;
    /* eslint-disable no-undef*/
    that.infobox = new Proxy({}, {
      set: function(obj, prop, value) {
        // 对设置的值进行格式化
        value = that.toFixed(prop, value);
        // 如果没有创建此行数据，那么对table进行插入此行数据操作
        if (!document.querySelector('.rp-infobox__container table #' + prop)) {
          let tr = document.createElement('tr');
          tr.setAttribute('id', prop);
          that.table.appendChild(tr);
          tr.innerHTML = '<th>' + prop + '</th><td>' + (value ? value : '暂无') + '</td>';
        } else {
          // 如果已经有这行数据，只进行更新
          document.querySelector('.rp-infobox__container table #' + prop + '> td').textContent = value ? value : '暂无';
        }
        obj[prop] = value;
        return true;
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
};

export default InfoBox;
