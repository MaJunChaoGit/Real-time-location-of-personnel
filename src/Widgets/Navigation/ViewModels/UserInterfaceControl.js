import defined from 'cesium/Core/defined';
import defineProperties from 'cesium/Core/defineProperties';
import DeveloperError from 'cesium/Core/DeveloperError';
import * as Knockout from 'knockout-es5/dist/knockout-es5.min';

/**
 * 用户操作最底层的视图模型的抽象模板接口
 *
 * @alias UserInterfaceControl
 * @constructor
 * @abstract
 *
 * @param {Terria} terria The Terria instance.
 */
var UserInterfaceControl = function(terria) {

  if (!defined(terria)) {
    throw new DeveloperError('terria is required');
  }

  this._terria = terria;

  /**
   * 获取或者设置一个控制条的标题
   * @observable.
   * @type {String}
   */
  this.name = 'Unnamed Control';

  /**
   * 获取或者设置ul显示的文字内容
   * @observable.
   * @type {String}
   */
  this.text = undefined;

  /**
   * 获取或者设置svg图标
   * @observable.
   * @type {Object}
   */
  this.svgIcon = undefined;

  /**
   * 获取或者设置svg的高度
   * @observable.
   * @type {Integer}
   */
  this.svgHeight = undefined;

  /**
   * 获取或者设置svg的宽度
   * @observable.
   * @type {Integer}
   */
  this.svgWidth = undefined;

  /**
   * 获取或者设置cssClass
   * @observable.
   * @type {String}
   */
  this.cssClass = undefined;

  /**
   * 获取或者设置该组件是否是激活状态
   * @observable.
   * @type {Boolean}
   */
  this.isActive = false;

  // 添加进入Knockout
  Knockout.track(this, ['name', 'svgIcon', 'svgHeight', 'svgWidth', 'cssClass', 'isActive']);
};

defineProperties(UserInterfaceControl.prototype, {
  /**
   * 获取cesiumWidget组件
   * @memberOf UserInterfaceControl.prototype
   * @type {Terria}
   */
  terria: {
    get: function() {
      return this._terria;
    }
  },
  /**
   * 判断按钮是否有文字说明
   * @type {Object}
   */
  hasText: {
    get: function() {
      return defined(this.text) && typeof this.text === 'string';
    }
  }

});

/**
 * 必须在子类中实现此方法，不然抛出异常
 * @abstract
 * @protected
 */
UserInterfaceControl.prototype.activate = function() {
  throw new DeveloperError('activate must be implemented in the derived class.');
};

export default UserInterfaceControl;
