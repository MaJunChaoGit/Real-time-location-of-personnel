import ScreenSpaceEventHandler from 'cesium/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import defined from 'cesium/Core/defined';
import carToDegrees from './carToDegrees';

/* eslint-disable no-undef */
const registerListener = Symbol('registerListener');
const removeListener = Symbol('removeListener');
const pickHandler = Symbol('pickHandler');
const scrollHandler = Symbol('scrollHandler');

let _viewer = {};
let _scene = {};
let _position = {};
let _handler = {};
let _isRun = false;
class Picker {
  /**
   * PickPosition模块构造器
   * @Author   Mjc
   * @exports
   * @param    {Function}               callback (obj, prop, value) [需要传入一个回调函数接收当前场景中pick的信息]
   * @return   {[PickPosition]}                                     [当前类的实例对象]
   */
  constructor(viewer, callback = () => {}) {
    // 检查callback是否传入
    if (!defined(viewer)) {
      throw new Error('需要传入viewer');
    }

    _viewer = viewer;
    _scene = viewer.scene;

    // 创建代理对象用来代理position,当position中的属性值发生改变时,会调用set中的用户传入的callback函数
    _position = new Proxy({
      lon: '0',
      lat: '0',
      height: '0',
      viewHeight: '0'
    }, {
      // 设置callback
      set: callback
    });

    // 创建监听事件控制器
    _handler = new ScreenSpaceEventHandler(_scene.canvas);
  }

  /**
   * 创建鼠标移动以及鼠标滚动滑动的监听
   */
  [registerListener]() {
    _handler.setInputAction(this[pickHandler], ScreenSpaceEventType.MOUSE_MOVE);
    _handler.setInputAction(this[scrollHandler], ScreenSpaceEventType.WHEEL);
    _isRun = true;
  }
  /**
   * 移除鼠标移动以及鼠标滚动滑动的监听
   */
  [removeListener]() {
    this._handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
    this._handler.removeInputAction(ScreenSpaceEventType.WHEEL);
    this._isRun = false;
  }

  /**
   * 拾取事件的处理方法
   */
  [pickHandler](movement) {
    let cartesian = _scene.camera.pickEllipsoid(movement.endPosition, _scene.globe.ellipsoid);
    cartesian && Object.assign(_position, carToDegrees(cartesian));
  }
  /**
   * 滚轮事件的处理方法
   */
  [scrollHandler]() {
    _position.viewHeight = viewer.camera.getViewHeight(2);
  }

  /**
   * 该方法为设置PickPostion是否工作
   * @Author   Mjc
   * @exports
   * @param    {[Boolean]}                 flag [如果传入的为true,那么开启pick模式,反之亦然]
   */
  setPickAbled(flag) {
    flag ? (!_isRun && this[registerListener]()) : (_isRun && this[removeListener]());
  }
}

export default Picker;
