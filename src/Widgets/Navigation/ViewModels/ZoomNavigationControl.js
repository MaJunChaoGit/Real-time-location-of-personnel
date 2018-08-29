import defined from 'cesium/Core/defined';
import Ray from 'cesium/Core/Ray';
import IntersectionTests from 'cesium/Core/IntersectionTests';
import Cartesian3 from 'cesium/Core/Cartesian3';
import SceneMode from 'cesium/Scene/SceneMode';
import NavigationControl from './NavigationControl';
import Utils from '../Core/Utils';

/**
 * 这个是一个缩放控制导航工具的类
 * @alias ZoomOutNavigationControl
 * @constructor
 * @abstract
 *
 * @param {Terria} terria The Terria instance.
 * @param {boolean} zoomIn is used for zooming in (true) or out (false)
 */
var ZoomNavigationControl = function(terria, zoomIn) {
  // 继承NavigationControl，并且NavigationControl继承于UserInterfaceControll抽象模板
  NavigationControl.apply(this, arguments);

  /**
   * 获取或者设置一个控制条的标题
   * 如果传入true的话 就是缩小，false为放大
   * @observable.
   * @type {String}
   */
  this.name = (zoomIn ? '放大' : '缩小');

  /**
   * 获取或者设置导航空间中的文本，如果有文字时则不现实svgIcon
   * @observable.
   * @type {String}
   */
  this.text = zoomIn ? '+' : '-';

  /**
   * 获取或者设置svg图标
   * @observable.
   * @type {String}
   */
  this.cssClass = 'navigation-control-icon-zoom-' + (zoomIn ? 'in' : 'out');

  this.relativeAmount = 2;

  if (zoomIn) {
    // 这确保了放大是与缩小相反，反之亦然，例如,放大和缩小时相机的位置仍然保留
    this.relativeAmount = 1 / this.relativeAmount;
  }
};

ZoomNavigationControl.prototype.relativeAmount = 1;

ZoomNavigationControl.prototype = Object.create(NavigationControl.prototype);

/**
     * 当用户执行点击操作时，执行该方法
     * @abstract
     * @protected
     */
ZoomNavigationControl.prototype.activate = function() {
  this.zoom(this.relativeAmount);
};

var cartesian3Scratch = new Cartesian3();

ZoomNavigationControl.prototype.zoom = function(relativeAmount) {

  this.isActive = true;

  // 判断是否定义了cesiumWidget组件
  if (defined(this.terria)) {
    // 获取scene
    var scene = this.terria.scene;
    // 获取当前屏幕空间摄像机控制器
    var sscc = scene.screenSpaceCameraController;
    // 判断是否开启缩放控制
    if (!sscc.enableInputs || !sscc.enableZoom) {
      return;
    }

    // 获取摄像机
    var camera = scene.camera;
    var orientation;

    // 判断场景当前模式,根据不同模式执行不同策略
    switch (scene.mode) {
      // 如果是正在切换的状态，那么直接结束
      case SceneMode.MORPHING:
        break;
        // 如果是2D状态下的,直接获取camera当前的高度然后执行zoomIn进行缩放
      case SceneMode.SCENE2D:
        camera.zoomIn(camera.positionCartographic.height * (1 - this.relativeAmount));
        break;
        // 默认执行
      default:
        var focus;

        if (defined(this.terria.trackedEntity)) {
          focus = new Cartesian3();
        } else {
          // 获取当前摄像机焦点坐标   投影后的
          focus = Utils.getCameraFocus(this.terria, false);
        }

        // 如果没有追踪的实体或者摄像机没有焦点的话
        if (!defined(focus)) {
          // 摄像机方向不指向地球，所以使用椭球体水平点作为焦点。
          var ray = new Ray(camera.worldToCameraCoordinatesPoint(scene.globe.ellipsoid.cartographicToCartesian(camera.positionCartographic)), camera.directionWC);
          // 获取椭球上离摄像机射线上最近的点
          focus = IntersectionTests.grazingAltitudeLocation(ray, scene.globe.ellipsoid);

          // 获取当前摄像机的hpr
          orientation = {
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll
          };
        } else {
          // 获取相机向上方向和摄像机的方向
          orientation = {
            direction: camera.direction,
            up: camera.up
          };
        }
        // 计算摄像机与焦点的分量差
        var direction = Cartesian3.subtract(camera.position, focus, cartesian3Scratch);
        // 计算摄像机方向向量与相对量的点乘
        var movementVector = Cartesian3.multiplyByScalar(direction, relativeAmount, direction);
        // 计算最终的飞行结束点位
        var endPosition = Cartesian3.add(focus, movementVector, focus);

        if (defined(this.terria.trackedEntity) || scene.mode === SceneMode.COLUMBUS_VIEW) {
          // 有时flyTo不起作用（跳到错误的位置），所以只需设置没有任何动画的位置
          // 在跟踪实体时不要使用flyTo，因为在动画过程中实体的位置可能会发生变化
          camera.position = endPosition;
        } else {
          camera.flyTo({
            destination: endPosition,
            orientation: orientation,
            duration: 0.5,
            convert: false
          });
        }
    }
  }

  // this.terria.notifyRepaintRequired();
  this.isActive = false;
};

export default ZoomNavigationControl;
