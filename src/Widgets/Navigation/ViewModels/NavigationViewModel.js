import defined from 'cesium/Core/defined';
import CesiumMath from 'cesium/Core/Math';
import getTimestamp from 'cesium/Core/getTimestamp';
import EventHelper from 'cesium/Core/EventHelper';
import Transforms from 'cesium/Core/Transforms';
import SceneMode from 'cesium/Scene/SceneMode';
import Cartesian2 from 'cesium/Core/Cartesian2';
import Cartesian3 from 'cesium/Core/Cartesian3';
import Matrix4 from 'cesium/Core/Matrix4';
import BoundingSphere from 'cesium/Core/BoundingSphere';
import HeadingPitchRange from 'cesium/Core/HeadingPitchRange';
import * as Knockout from 'knockout-es5/dist/knockout-es5.min';
import loadView from '../Core/loadView';
import ResetViewNavigationControl from './ResetViewNavigationControl';
import ZoomNavigationControl from './ZoomNavigationControl';

import svgCompassOuterRing from '../SvgPaths/svgCompassOuterRing.js';
import svgCompassGyro from '../SvgPaths/svgCompassGyro.js';
import svgCompassRotationMarker from '../SvgPaths/svgCompassRotationMarker.js';
import Utils from '../Core/Utils';

// 导航视图模型
var NavigationViewModel = function(options) {

  this.terria = options.terria;
  this.eventHelper = new EventHelper();
  // 判断是否允许缩放控制
  this.enableZoomControls = (defined(options.enableZoomControls)) ? options.enableZoomControls : true;
  // 判断是否开启指南针
  this.enableCompass = (defined(options.enableCompass)) ? options.enableCompass : true;

  // if (this.showZoomControls)
  //   {
  this.controls = options.controls;
  if (!defined(this.controls)) {
    this.controls = [
      // 获取zoomIn控制器
      new ZoomNavigationControl(this.terria, true),
      // 获取重置导航控制器
      new ResetViewNavigationControl(this.terria),
      // 获取zoomOout控制器
      new ZoomNavigationControl(this.terria, false)
    ];
  }
  // }
  // 获取svg小图标
  this.svgCompassOuterRing = svgCompassOuterRing;
  this.svgCompassGyro = svgCompassGyro;
  this.svgCompassRotationMarker = svgCompassRotationMarker;

  // 如果传入cesiumWidget并且开启了指南证功能
  this.showCompass = defined(this.terria) && this.enableCompass;
  // 获取摄像机的heading
  this.heading = this.showCompass ? this.terria.scene.camera.heading : 0.0;

  this.isOrbiting = false;
  this.orbitCursorAngle = 0;
  this.orbitCursorOpacity = 0.0;
  this.orbitLastTimestamp = 0;
  this.orbitFrame = undefined;
  this.orbitIsLook = false;
  this.orbitMouseMoveFunction = undefined;
  this.orbitMouseUpFunction = undefined;

  this.isRotating = false;
  this.rotateInitialCursorAngle = undefined;
  this.rotateFrame = undefined;
  this.rotateIsLook = false;
  this.rotateMouseMoveFunction = undefined;
  this.rotateMouseUpFunction = undefined;

  this._unsubcribeFromPostRender = undefined;

  Knockout.track(this, ['controls', 'showCompass', 'heading', 'isOrbiting', 'orbitCursorAngle', 'isRotating']);

  var that = this;

  // 组件变换控制时间
  function widgetChange() {
    // 如果定义了cesiumWidget的话
    if (defined(that.terria)) {
      // 判断是否退订
      if (that._unsubcribeFromPostRender) {
        that._unsubcribeFromPostRender();
        that._unsubcribeFromPostRender = undefined;
      }
      // 显示指南针
      that.showCompass = true && that.enableCompass;

      // 将摄像机的heading和轨道的heading绑定,并生成退出方法
      that._unsubcribeFromPostRender = that.terria.scene.postRender.addEventListener(function() {
        that.heading = that.terria.scene.camera.heading;
      });
    } else { // 如果cesiumWidget未定义的关闭监听，并且隐藏指南证
      if (that._unsubcribeFromPostRender) {
        that._unsubcribeFromPostRender();
        that._unsubcribeFromPostRender = undefined;
      }
      that.showCompass = false;
    }
  }
  // 通过eventHelper监听afterWidgetChanged,并绑定事件
  this.eventHelper.add(this.terria.afterWidgetChanged, widgetChange, this);
  // this.terria.afterWidgetChanged.addEventListener(widgetChange);

  // 初始化事件
  widgetChange();
};

// 移除所有绑定的事件
NavigationViewModel.prototype.destroy = function() {

  this.eventHelper.removeAll();

  // loadView(require('fs').readFileSync(baseURLEmpCesium + 'js-lib/terrajs/lib/Views/Navigation.html', 'utf8'), container, this);

};

NavigationViewModel.prototype.show = function(container) {
  var testing;
  // 如果开启了缩放和指南证功能
  if (this.enableZoomControls && this.enableCompass) {
    testing = '<div class="compass"  data-bind="visible: showCompass, event: { mousedown: handleMouseDown, dblclick: handleDoubleClick }">' +
                // '<div class="compass-outer-ring-background"></div>' +
                // ' <div class="compass-rotation-marker" data-bind="visible: isOrbiting, style: { transform: \'rotate(-\' + orbitCursorAngle + \'rad)\', \'-webkit-transform\': \'rotate(-\' + orbitCursorAngle + \'rad)\', opacity: orbitCursorOpacity }, cesiumSvgPath: { path: svgCompassRotationMarker, width: 145, height: 145 }"></div>' +
                ' <div class="compass-rotation-marker" data-bind="visible: isOrbiting, style: { transform: \'rotate(-\' + orbitCursorAngle + \'rad)\', \'-webkit-transform\': \'rotate(-\' + orbitCursorAngle + \'rad)\', opacity: orbitCursorOpacity }"></div>' +
                ' <div class="compass-outer-ring" title="点击中心位置重置摄像机或者拖拽旋转摄像机" data-bind="style: { transform: \'rotate(-\' + heading + \'rad)\', \'-webkit-transform\': \'rotate(-\' + heading + \'rad)\' }"></div>' +
                // ' <div class="compass-gyro-background"></div>' +
                // ' <div class="compass-gyro" data-bind="cesiumSvgPath: { path: svgCompassGyro, width: 145, height: 145 }, css: { \'compass-gyro-active\': isOrbiting }"></div>' +
                ' <div class="compass-gyro", css: { \'compass-gyro-active\': isOrbiting }"></div>' +
                '</div>' +
                '<div class="navigation-controls">' +
                '<!-- ko foreach: controls -->' +
                '<div data-bind="click: activate, attr: { title: $data.name }, css: $root.isLastControl($data) ? \'navigation-control-last\' : \'navigation-control\' ">' +
                '   <!-- ko if: $data.hasText -->' +
                '   <div data-bind="text: $data.text, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' +
                '   <!-- /ko -->' +
                '  <!-- ko ifnot: $data.hasText -->' +
                '  <div data-bind="cesiumSvgPath: { path: $data.svgIcon, width: $data.svgWidth, height: $data.svgHeight }, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' +
                '  <!-- /ko -->' +
                ' </div>' +
                ' <!-- /ko -->' +
                '</div>';
    // 如果开启了指南证，关闭了缩放功能
  } else if (!this.enableZoomControls && this.enableCompass) {
    testing = '<div class="compass" title="Drag outer ring: rotate view. ' +
                'Drag inner gyroscope: free orbit.' +
                'Double-click: reset view.' +
                'TIP: You can also free orbit by holding the CTRL key and dragging the map." data-bind="visible: showCompass, event: { mousedown: handleMouseDown, dblclick: handleDoubleClick }">' +
                '<div class="compass-outer-ring-background"></div>' +
                ' <div class="compass-rotation-marker" data-bind="visible: isOrbiting, style: { transform: \'rotate(-\' + orbitCursorAngle + \'rad)\', \'-webkit-transform\': \'rotate(-\' + orbitCursorAngle + \'rad)\', opacity: orbitCursorOpacity }, cesiumSvgPath: { path: svgCompassRotationMarker, width: 145, height: 145 }"></div>' +
                ' <div class="compass-outer-ring" title="Click and drag to rotate the camera" data-bind="style: { transform: \'rotate(-\' + heading + \'rad)\', \'-webkit-transform\': \'rotate(-\' + heading + \'rad)\' }, cesiumSvgPath: { path: svgCompassOuterRing, width: 145, height: 145 }"></div>' +
                ' <div class="compass-gyro-background"></div>' +
                ' <div class="compass-gyro" data-bind="cesiumSvgPath: { path: svgCompassGyro, width: 145, height: 145 }, css: { \'compass-gyro-active\': isOrbiting }"></div>' +
                '</div>' +
                '<div class="navigation-controls"  style="display: none;" >' +
                '<!-- ko foreach: controls -->' +
                '<div data-bind="click: activate, attr: { title: $data.name }, css: $root.isLastControl($data) ? \'navigation-control-last\' : \'navigation-control\' ">' +
                '   <!-- ko if: $data.hasText -->' +
                '   <div data-bind="text: $data.text, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' +
                '   <!-- /ko -->' +
                '  <!-- ko ifnot: $data.hasText -->' +
                '  <div data-bind="cesiumSvgPath: { path: $data.svgIcon, width: $data.svgWidth, height: $data.svgHeight }, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' +
                '  <!-- /ko -->' +
                ' </div>' +
                ' <!-- /ko -->' +
                '</div>';
    // 如果开启了缩放功能，关闭了指南证功能
  } else if (this.enableZoomControls && !this.enableCompass) {
    testing = '<div class="compass"  style="display: none;" title="Drag outer ring: rotate view. ' +
                'Drag inner gyroscope: free orbit.' +
                'Double-click: reset view.' +
                'TIP: You can also free orbit by holding the CTRL key and dragging the map." data-bind="visible: showCompass, event: { mousedown: handleMouseDown, dblclick: handleDoubleClick }">' +
                '<div class="compass-outer-ring-background"></div>' +
                ' <div class="compass-rotation-marker" data-bind="visible: isOrbiting, style: { transform: \'rotate(-\' + orbitCursorAngle + \'rad)\', \'-webkit-transform\': \'rotate(-\' + orbitCursorAngle + \'rad)\', opacity: orbitCursorOpacity }, cesiumSvgPath: { path: svgCompassRotationMarker, width: 145, height: 145 }"></div>' +
                ' <div class="compass-outer-ring" title="Click and drag to rotate the camera" data-bind="style: { transform: \'rotate(-\' + heading + \'rad)\', \'-webkit-transform\': \'rotate(-\' + heading + \'rad)\' }, cesiumSvgPath: { path: svgCompassOuterRing, width: 145, height: 145 }"></div>' +
                ' <div class="compass-gyro-background"></div>' +
                ' <div class="compass-gyro" data-bind="cesiumSvgPath: { path: svgCompassGyro, width: 145, height: 145 }, css: { \'compass-gyro-active\': isOrbiting }"></div>' +
                '</div>' +
                '<div class="navigation-controls"    >' +
                '<!-- ko foreach: controls -->' +
                '<div data-bind="click: activate, attr: { title: $data.name }, css: $root.isLastControl($data) ? \'navigation-control-last\' : \'navigation-control\' ">' +
                '   <!-- ko if: $data.hasText -->' +
                '   <div data-bind="text: $data.text, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' +
                '   <!-- /ko -->' +
                '  <!-- ko ifnot: $data.hasText -->' +
                '  <div data-bind="cesiumSvgPath: { path: $data.svgIcon, width: $data.svgWidth, height: $data.svgHeight }, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' +
                '  <!-- /ko -->' +
                ' </div>' +
                ' <!-- /ko -->' +
                '</div>';
    // 如果两个功能都关闭了
  } else if (!this.enableZoomControls && !this.enableCompass) {
    testing = '<div class="compass"  style="display: none;" title="Drag outer ring: rotate view. ' +
                'Drag inner gyroscope: free orbit.' +
                'Double-click: reset view.' +
                'TIP: You can also free orbit by holding the CTRL key and dragging the map." data-bind="visible: showCompass, event: { mousedown: handleMouseDown, dblclick: handleDoubleClick }">' +
                '<div class="compass-outer-ring-background"></div>' +
                ' <div class="compass-rotation-marker" data-bind="visible: isOrbiting, style: { transform: \'rotate(-\' + orbitCursorAngle + \'rad)\', \'-webkit-transform\': \'rotate(-\' + orbitCursorAngle + \'rad)\', opacity: orbitCursorOpacity }, cesiumSvgPath: { path: svgCompassRotationMarker, width: 145, height: 145 }"></div>' +
                ' <div class="compass-outer-ring" title="Click and drag to rotate the camera" data-bind="style: { transform: \'rotate(-\' + heading + \'rad)\', \'-webkit-transform\': \'rotate(-\' + heading + \'rad)\' }, cesiumSvgPath: { path: svgCompassOuterRing, width: 145, height: 145 }"></div>' +
                ' <div class="compass-gyro-background"></div>' +
                ' <div class="compass-gyro" data-bind="cesiumSvgPath: { path: svgCompassGyro, width: 145, height: 145 }, css: { \'compass-gyro-active\': isOrbiting }"></div>' +
                '</div>' +
                '<div class="navigation-controls"   style="display: none;" >' +
                '<!-- ko foreach: controls -->' +
                '<div data-bind="click: activate, attr: { title: $data.name }, css: $root.isLastControl($data) ? \'navigation-control-last\' : \'navigation-control\' ">' +
                '   <!-- ko if: $data.hasText -->' +
                '   <div data-bind="text: $data.text, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' +
                '   <!-- /ko -->' +
                '  <!-- ko ifnot: $data.hasText -->' +
                '  <div data-bind="cesiumSvgPath: { path: $data.svgIcon, width: $data.svgWidth, height: $data.svgHeight }, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' +
                '  <!-- /ko -->' +
                ' </div>' +
                ' <!-- /ko -->' +
                '</div>';
  }
  // 载入视图
  loadView(testing, container, this);
  // loadView(navigatorTemplate, container, this);
  // loadView(require('fs').readFileSync(baseURLEmpCesium + 'js-lib/terrajs/lib/Views/Navigation.html', 'utf8'), container, this);

};

/**
     * controls的添加方法
     * @param {NavControl}
     */
NavigationViewModel.prototype.add = function(control) {
  this.controls.push(control);
};

/**
     * controls的移除方法
     * @param {NavControl} control The control to remove.
     */
NavigationViewModel.prototype.remove = function(control) {
  this.controls.remove(control);
};

/**
     * 检查传入的控制器是否是最后一个
     * @param {NavControl} control The control to remove.
     */
NavigationViewModel.prototype.isLastControl = function(control) {
  return (control === this.controls[this.controls.length - 1]);
};

var vectorScratch = new Cartesian2();

// 鼠标事件控制方法
NavigationViewModel.prototype.handleMouseDown = function(viewModel, e) {

  // 获取场景
  var scene = this.terria.scene;
  // 判断是否正在变换视图
  if (scene.mode === SceneMode.MORPHING) {
    return true;
  }
  // 获得其监听器触发了事件的那个元素
  var compassElement = e.currentTarget;
  // 获得当前监听对象与页面的距离
  var compassRectangle = e.currentTarget.getBoundingClientRect();
  // 获取监听对象宽度
  var maxDistance = compassRectangle.width / 2.0;
  // 获取监听对象的中心点
  var center = new Cartesian2((compassRectangle.right - compassRectangle.left) / 2.0, (compassRectangle.bottom - compassRectangle.top) / 2.0);
  // 获取鼠标点击的位置
  var clickLocation = new Cartesian2(e.clientX - compassRectangle.left, e.clientY - compassRectangle.top);
  // 获取鼠标与点击位置的分量差
  var vector = Cartesian2.subtract(clickLocation, center, vectorScratch);
  // 获取点击位置与中心点的距离
  var distanceFromCenter = Cartesian2.magnitude(vector);
  // 计算距离的分数
  var distanceFraction = distanceFromCenter / maxDistance;

  var nominalTotalRadius = 145;
  var norminalGyroRadius = 50;
  // TODO
  if (distanceFraction < norminalGyroRadius / nominalTotalRadius) {
    orbit(this, compassElement, vector);
    //            return false;
  } else if (distanceFraction < 1.0) {
    rotate(this, compassElement, vector);
    //            return false;
  } else {
    return true;
  }
};

var oldTransformScratch = new Matrix4();
var newTransformScratch = new Matrix4();
var centerScratch = new Cartesian3();

NavigationViewModel.prototype.handleDoubleClick = function(viewModel, e) {
  // 获取scene
  var scene = viewModel.terria.scene;
  // 获取camera
  var camera = scene.camera;
  // 获取屏幕空间摄像机控制器
  var sscc = scene.screenSpaceCameraController;
  // 如果场景正在变换或者禁止输入
  if (scene.mode === SceneMode.MORPHING || !sscc.enableInputs) {
    return true;
  }
  // 如果场景是哥伦布视角,并且禁止地图平移
  if (scene.mode === SceneMode.COLUMBUS_VIEW && !sscc.enableTranslate) {
    return;
  }
  // 如果是3D或者是哥伦布视角的话
  if (scene.mode === SceneMode.SCENE3D || scene.mode === SceneMode.COLUMBUS_VIEW) {
    // 如果摄像机为禁止自由观察
    if (!sscc.enableLook) {
      return;
    }
    // 如果场景为3D并且禁止旋转
    if (scene.mode === SceneMode.SCENE3D) {
      if (!sscc.enableRotate) {
        return;
      }
    }
  }
  // 获取当前摄像机的关注点
  var center = Utils.getCameraFocus(viewModel.terria, true, centerScratch);

  // 如果摄像机没有中心点的话，那么久直接重置视图
  if (!defined(center)) {
    this.controls[1].resetView();
    return;
  }
  // 获取摄像机的笛卡尔组标
  var cameraPosition = scene.globe.ellipsoid.cartographicToCartesian(camera.positionCartographic, new Cartesian3());
  // 计算摄像机关注点与椭球切线的法线
  var surfaceNormal = scene.globe.ellipsoid.geodeticSurfaceNormal(center);

  // TODO
  var focusBoundingSphere = new BoundingSphere(center, 0);

  camera.flyToBoundingSphere(focusBoundingSphere, {
    offset: new HeadingPitchRange(0,
      // 不要直接使用pitch
      CesiumMath.PI_OVER_TWO - Cartesian3.angleBetween(
        surfaceNormal,
        camera.directionWC
      ),
      // 在2D或者哥伦布视图中使用camera.distanceToBoundingSphere会出现错误的返回值,应当手动计算
      Cartesian3.distance(cameraPosition, center)
    ),
    duration: 1.5
  });
};

// NavigationViewModel创建实例的入口方法
NavigationViewModel.create = function(options) {
  var result = new NavigationViewModel(options);
  // 创建div插入dom文档
  result.show(options.container);
  return result;
};

function orbit(viewModel, compassElement, cursorVector) {
  // 获取当前场景
  var scene = viewModel.terria.scene;
  // 获取当前屏幕摄像机控制器
  var sscc = scene.screenSpaceCameraController;

  // 如果处于变换状态或者禁用所有输入
  if (scene.mode === SceneMode.MORPHING || !sscc.enableInputs) {
    return;
  }

  switch (scene.mode) {
    case SceneMode.COLUMBUS_VIEW:
      if (sscc.enableLook) {
        break;
      }

      if (!sscc.enableTranslate || !sscc.enableTilt) {
        return;
      }
      break;
    case SceneMode.SCENE3D:
      if (sscc.enableLook) {
        break;
      }

      if (!sscc.enableTilt || !sscc.enableRotate) {
        return;
      }
      break;
    case SceneMode.SCENE2D:
      if (!sscc.enableTranslate) {
        return;
      }
      break;
  }

  // Remove existing event handlers, if any.
  document.removeEventListener('mousemove', viewModel.orbitMouseMoveFunction, false);
  document.removeEventListener('mouseup', viewModel.orbitMouseUpFunction, false);

  if (defined(viewModel.orbitTickFunction)) {
    viewModel.terria.clock.onTick.removeEventListener(viewModel.orbitTickFunction);
  }

  viewModel.orbitMouseMoveFunction = undefined;
  viewModel.orbitMouseUpFunction = undefined;
  viewModel.orbitTickFunction = undefined;

  viewModel.isOrbiting = true;
  viewModel.orbitLastTimestamp = getTimestamp();

  var camera = scene.camera;

  if (defined(viewModel.terria.trackedEntity)) {
    // when tracking an entity simply use that reference frame
    viewModel.orbitFrame = undefined;
    viewModel.orbitIsLook = false;
  } else {
    var center = Utils.getCameraFocus(viewModel.terria, true, centerScratch);

    if (!defined(center)) {
      viewModel.orbitFrame = Transforms.eastNorthUpToFixedFrame(camera.positionWC, scene.globe.ellipsoid, newTransformScratch);
      viewModel.orbitIsLook = true;
    } else {
      viewModel.orbitFrame = Transforms.eastNorthUpToFixedFrame(center, scene.globe.ellipsoid, newTransformScratch);
      viewModel.orbitIsLook = false;
    }
  }

  viewModel.orbitTickFunction = function(e) {
    var timestamp = getTimestamp();
    var deltaT = timestamp - viewModel.orbitLastTimestamp;
    var rate = (viewModel.orbitCursorOpacity - 0.5) * 2.5 / 1000;
    var distance = deltaT * rate;

    var angle = viewModel.orbitCursorAngle + CesiumMath.PI_OVER_TWO;
    var x = Math.cos(angle) * distance;
    var y = Math.sin(angle) * distance;

    var oldTransform;

    if (defined(viewModel.orbitFrame)) {
      oldTransform = Matrix4.clone(camera.transform, oldTransformScratch);

      camera.lookAtTransform(viewModel.orbitFrame);
    }

    // do not look up/down or rotate in 2D mode
    if (scene.mode === SceneMode.SCENE2D) {
      camera.move(new Cartesian3(x, y, 0), Math.max(scene.canvas.clientWidth, scene.canvas.clientHeight) / 100 * camera.positionCartographic.height * distance);
    } else {
      if (viewModel.orbitIsLook) {
        camera.look(Cartesian3.UNIT_Z, -x);
        camera.look(camera.right, -y);
      } else {
        camera.rotateLeft(x);
        camera.rotateUp(y);
      }
    }

    if (defined(viewModel.orbitFrame)) {
      camera.lookAtTransform(oldTransform);
    }

    // viewModel.terria.cesium.notifyRepaintRequired();

    viewModel.orbitLastTimestamp = timestamp;
  };

  // 更新轨道上的角度与透明度
  function updateAngleAndOpacity(vector, compassWidth) {
    var angle = Math.atan2(-vector.y, vector.x);
    viewModel.orbitCursorAngle = CesiumMath.zeroToTwoPi(angle - CesiumMath.PI_OVER_TWO);

    var distance = Cartesian2.magnitude(vector);
    var maxDistance = compassWidth / 2.0;
    var distanceFraction = Math.min(distance / maxDistance, 1.0);
    var easedOpacity = 0.5 * distanceFraction * distanceFraction + 0.5;
    viewModel.orbitCursorOpacity = easedOpacity;

  }

  // 鼠标移入事件
  viewModel.orbitMouseMoveFunction = function(e) {
    // 获取当前监听事件的元素距离页面的矩形范围
    var compassRectangle = compassElement.getBoundingClientRect();
    // 获取元素中心点位置
    var center = new Cartesian2((compassRectangle.right - compassRectangle.left) / 2.0, (compassRectangle.bottom - compassRectangle.top) / 2.0);
    // 获取点击的位置
    var clickLocation = new Cartesian2(e.clientX - compassRectangle.left, e.clientY - compassRectangle.top);
    // 计算点击位置与中心点位置的距离分量差
    var vector = Cartesian2.subtract(clickLocation, center, vectorScratch);
    // 更新轨道上的角度与透明度
    updateAngleAndOpacity(vector, compassRectangle.width);
  };

  viewModel.orbitMouseUpFunction = function(e) {
    // TODO: if mouse didn't move, reset view to looking down, north is up?

    viewModel.isOrbiting = false;
    document.removeEventListener('mousemove', viewModel.orbitMouseMoveFunction, false);
    document.removeEventListener('mouseup', viewModel.orbitMouseUpFunction, false);

    if (defined(viewModel.orbitTickFunction)) {
      viewModel.terria.clock.onTick.removeEventListener(viewModel.orbitTickFunction);
    }

    viewModel.orbitMouseMoveFunction = undefined;
    viewModel.orbitMouseUpFunction = undefined;
    viewModel.orbitTickFunction = undefined;
  };

  document.addEventListener('mousemove', viewModel.orbitMouseMoveFunction, false);
  document.addEventListener('mouseup', viewModel.orbitMouseUpFunction, false);
  viewModel.terria.clock.onTick.addEventListener(viewModel.orbitTickFunction);

  updateAngleAndOpacity(cursorVector, compassElement.getBoundingClientRect().width);
}

function rotate(viewModel, compassElement, cursorVector) {
  viewModel.terria.options.enableCompassOuterRing = (
    defined(viewModel.terria.options.enableCompassOuterRing)) ? viewModel.terria.options.enableCompassOuterRing : true;
  if (viewModel.terria.options.enableCompassOuterRing) {
    var scene = viewModel.terria.scene;
    var camera = scene.camera;

    var sscc = scene.screenSpaceCameraController;
    // do not rotate in 2D mode or if rotating is disabled
    if (scene.mode === SceneMode.MORPHING || scene.mode === SceneMode.SCENE2D || !sscc.enableInputs) {
      return;
    }
    if (!sscc.enableLook && (scene.mode === SceneMode.COLUMBUS_VIEW || (scene.mode === SceneMode.SCENE3D && !sscc.enableRotate))) {
      return;
    }

    // Remove existing event handlers, if any.
    document.removeEventListener('mousemove', viewModel.rotateMouseMoveFunction, false);
    document.removeEventListener('mouseup', viewModel.rotateMouseUpFunction, false);

    viewModel.rotateMouseMoveFunction = undefined;
    viewModel.rotateMouseUpFunction = undefined;

    viewModel.isRotating = true;
    viewModel.rotateInitialCursorAngle = Math.atan2(-cursorVector.y, cursorVector.x);

    if (defined(viewModel.terria.trackedEntity)) {
      // when tracking an entity simply use that reference frame
      viewModel.rotateFrame = undefined;
      viewModel.rotateIsLook = false;
    } else {
      var viewCenter = Utils.getCameraFocus(viewModel.terria, true, centerScratch);

      if (!defined(viewCenter) || (scene.mode === SceneMode.COLUMBUS_VIEW && !sscc.enableLook && !sscc.enableTranslate)) {
        viewModel.rotateFrame = Transforms.eastNorthUpToFixedFrame(camera.positionWC, scene.globe.ellipsoid, newTransformScratch);
        viewModel.rotateIsLook = true;
      } else {
        viewModel.rotateFrame = Transforms.eastNorthUpToFixedFrame(viewCenter, scene.globe.ellipsoid, newTransformScratch);
        viewModel.rotateIsLook = false;
      }
    }

    var oldTransform;
    if (defined(viewModel.rotateFrame)) {
      oldTransform = Matrix4.clone(camera.transform, oldTransformScratch);
      camera.lookAtTransform(viewModel.rotateFrame);
    }

    viewModel.rotateInitialCameraAngle = -camera.heading;

    if (defined(viewModel.rotateFrame)) {
      camera.lookAtTransform(oldTransform);
    }

    viewModel.rotateMouseMoveFunction = function(e) {
      var compassRectangle = compassElement.getBoundingClientRect();
      var center = new Cartesian2((compassRectangle.right - compassRectangle.left) / 2.0, (compassRectangle.bottom - compassRectangle.top) / 2.0);
      var clickLocation = new Cartesian2(e.clientX - compassRectangle.left, e.clientY - compassRectangle.top);
      var vector = Cartesian2.subtract(clickLocation, center, vectorScratch);
      var angle = Math.atan2(-vector.y, vector.x);

      var angleDifference = angle - viewModel.rotateInitialCursorAngle;
      var newCameraAngle = CesiumMath.zeroToTwoPi(viewModel.rotateInitialCameraAngle - angleDifference);

      var camera = viewModel.terria.scene.camera;

      var oldTransform;
      if (defined(viewModel.rotateFrame)) {
        oldTransform = Matrix4.clone(camera.transform, oldTransformScratch);
        camera.lookAtTransform(viewModel.rotateFrame);
      }

      var currentCameraAngle = -camera.heading;
      camera.rotateRight(newCameraAngle - currentCameraAngle);

      if (defined(viewModel.rotateFrame)) {
        camera.lookAtTransform(oldTransform);
      }

      // viewModel.terria.cesium.notifyRepaintRequired();
    };

    viewModel.rotateMouseUpFunction = function(e) {
      viewModel.isRotating = false;
      document.removeEventListener('mousemove', viewModel.rotateMouseMoveFunction, false);
      document.removeEventListener('mouseup', viewModel.rotateMouseUpFunction, false);

      viewModel.rotateMouseMoveFunction = undefined;
      viewModel.rotateMouseUpFunction = undefined;
    };

    document.addEventListener('mousemove', viewModel.rotateMouseMoveFunction, false);
    document.addEventListener('mouseup', viewModel.rotateMouseUpFunction, false);
  }
}
export default NavigationViewModel;
