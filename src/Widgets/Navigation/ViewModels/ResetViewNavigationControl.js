import defined from 'cesium/Core/defined';
import Camera from 'cesium/Scene/Camera';
import Rectangle from 'cesium/Core/Rectangle';
import Cartographic from 'cesium/Core/Cartographic';
import Cartesian3 from 'cesium/Core/Cartesian3';
import NavigationControl from './NavigationControl';
import svgReset from '../SvgPaths/svgReset';
/**
     * The model for a zoom in control in the navigation control tool bar
     *
     * @alias ResetViewNavigationControl
     * @constructor
     * @abstract
     *
     * @param {Terria} terria The Terria instance.
     */
/* eslint-disable no-unused-vars */

var ResetViewNavigationControl = function(terria) {
  NavigationControl.apply(this, arguments);

  /**
         * 获取或者设置一个控制条的标题
         * @observable.
         * This property is observable.
         * @type {String}
         */
  this.name = '重置';

  /**
         * 获取或者设置svg图标
         * @observable.
         * @type {Object}
         */
  this.svgIcon = svgReset;

  /**
         * 获取或者设置svg图表的高度
         * @observable.
         * @type {Integer}
         */
  this.svgHeight = 15;

  /**
         * 获取或者设置svg图表的宽度
         * @observable.
         * @type {Integer}
         */
  this.svgWidth = 15;

  /**
         * 获取或者设置CSS样式表
         * @observable.
         * @type {String}
         */
  this.cssClass = 'navigation-control-icon-reset';

};

ResetViewNavigationControl.prototype = Object.create(NavigationControl.prototype);

ResetViewNavigationControl.prototype.resetView = function() {
  // this.terria.analytics.logEvent('navigation', 'click', 'reset');
  // 获取当前场景
  var scene = this.terria.scene;
  // 获取当前场景的屏幕空间摄像机控制器
  var sscc = scene.screenSpaceCameraController;
  // 判断是否允许操作摄像机
  if (!sscc.enableInputs) {
    return;
  }

  this.isActive = true;
  // 获取当前摄像机
  var camera = scene.camera;

  // 判断是否有正在追踪的实体
  if (defined(this.terria.trackedEntity)) {
    // 当跟踪实体不会重置为默认椭球视图，而是重置为跟踪实体的默认视图
    var trackedEntity = this.terria.trackedEntity;
    this.terria.trackedEntity = undefined;
    this.terria.trackedEntity = trackedEntity;
  } else {
    // 重置视图为之前定义的defaultResetView
    if (this.terria.options.defaultResetView) {
      // 判断是否设置defaultResetView,并且defaultResetView为制图坐标
      if (this.terria.options.defaultResetView && this.terria.options.defaultResetView instanceof Cartographic) {
        camera.flyTo({
          // 制图坐标系转为笛卡尔坐标系
          destination: scene.globe.ellipsoid.cartographicToCartesian(this.terria.options.defaultResetView)
        });

      } else if (this.terria.options.defaultResetView && this.terria.options.defaultResetView instanceof Rectangle) {
        try {
          // 验证defaultResetView是否为矩形
          Rectangle.validate(this.terria.options.defaultResetView);

          camera.flyTo({
            destination: this.terria.options.defaultResetView
          });
        } catch (e) {
          console.log('Cesium-navigation/ResetViewNavigationControl:   options.defaultResetView Cesium rectangle is  invalid!');
        }
      }
    } else if (typeof camera.flyHome === 'function') { // 如果camera.flyHome被定义,直接调用camera.flyHome
      camera.flyTo({
        destination: Cartesian3.fromDegrees(110.435314, 37.960521, 15000000.0)
      });
    } else {
      camera.flyTo({'destination': Camera.DEFAULT_VIEW_RECTANGLE, 'duration': 1});
    }
  }
  this.isActive = false;
};

/**
     * 用户点击操作时执行的方法
     * on this control
     * @abstract
     * @protected
     */
ResetViewNavigationControl.prototype.activate = function() {
  this.resetView();
};

export default ResetViewNavigationControl;
