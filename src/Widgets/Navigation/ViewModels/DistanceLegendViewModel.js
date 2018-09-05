import defined from 'cesium/Core/defined';
import DeveloperError from 'cesium/Core/DeveloperError';
import EllipsoidGeodesic from 'cesium/Core/EllipsoidGeodesic';
import Cartesian2 from 'cesium/Core/Cartesian2';
import getTimestamp from 'cesium/Core/getTimestamp';
import EventHelper from 'cesium/Core/EventHelper';
import * as Knockout from 'knockout-es5/dist/knockout-es5.min';
import loadView from '../Core/loadView';

/**
     * 比例尺构造函数
     * @Author   Mjc
     * @DateTime 2018-04-23T16:16:15+0800
     * @exports
     * @param    {[type]}                 options [description]
     * @Example {
     *               container: this.distanceLegendDiv,
     *               terria: this.terria,
     *               mapElement: container,
     *               enableDistanceLegend: true
     *           }
     */
var DistanceLegendViewModel = function(options) {
  if (!defined(options) || !defined(options.terria)) {
    throw new DeveloperError('options.terria is required.');
  }

  this.terria = options.terria;
  this._removeSubscription = undefined;
  this._lastLegendUpdate = undefined;
  this.eventHelper = new EventHelper();

  this.distanceLabel = undefined;
  this.barWidth = undefined;

  // 如果没有传入enableDistanceLegend=true的话,那么默认为开启比例尺
  this.enableDistanceLegend = (defined(options.enableDistanceLegend)) ? options.enableDistanceLegend : true;

  // 为DistanceLegendViewModel的实例的'distanceLabel', 'barWidth'属性添加订阅通知
  Knockout.track(this, ['distanceLabel', 'barWidth']);

  // 注册移除订阅事件
  this.eventHelper.add(this.terria.afterWidgetChanged, function() {
    if (defined(this._removeSubscription)) {
      this._removeSubscription();
      this._removeSubscription = undefined;
    }
  }, this);
  //        this.terria.beforeWidgetChanged.addEventListener(function () {
  //            if (defined(this._removeSubscription)) {
  //                this._removeSubscription();
  //                this._removeSubscription = undefined;
  //            }
  //        }, this);

  var that = this;
  // 添加更新订阅方法
  function addUpdateSubscription() {
    if (defined(that.terria)) {
      // 获取实例中的scene
      var scene = that.terria.scene;
      // 当scene中发生了渲染,那么更新比例尺
      that._removeSubscription = scene.postRender.addEventListener(function() {
        updateDistanceLegendCesium(this, scene);
      }, that);
    }
    // 如果没有定义三维球的话,那么调用leaflet
    // else if (defined(that.terria.leaflet)) {
    //     var map = that.terria.leaflet.map;

    //     var potentialChangeCallback = function potentialChangeCallback() {
    //         updateDistanceLegendLeaflet(that, map);
    //     };

    //     that._removeSubscription = function () {
    //         map.off('zoomend', potentialChangeCallback);
    //         map.off('moveend', potentialChangeCallback);
    //     };

    //     map.on('zoomend', potentialChangeCallback);
    //     map.on('moveend', potentialChangeCallback);

    //     updateDistanceLegendLeaflet(that, map);
    // }
  }
  // 添加更新订阅
  addUpdateSubscription();
  this.eventHelper.add(this.terria.afterWidgetChanged, function() {
    addUpdateSubscription();
  }, this);
  // this.terria.afterWidgetChanged.addEventListener(function() {
  //    addUpdateSubscription();
  // }, this);
};

// 摧毁所有比例尺的事件
DistanceLegendViewModel.prototype.destroy = function() {

  this.eventHelper.removeAll();
};

// 比例尺显示方法
DistanceLegendViewModel.prototype.show = function(container) {
  var testing ;
  // 如果用户开启了比例尺功能
  if (this.enableDistanceLegend) {
    var baseWidth = document.querySelector('#rp-distance-legend').clientWidth;
    testing = '<div class="distance-legend" data-bind="visible: distanceLabel && barWidth">' +
              '<div class="distance-legend-label" data-bind="text: distanceLabel"></div>' +
              '<div class="distance-legend-scale-bar" data-bind="style: { width: barWidth + \'px\', left: ((' + baseWidth + '- barWidth) / 2) + \'px\' }"></div>' +
              '</div>';
  } else {
    testing = '<div class="distance-legend"  style="display: none;" data-bind="visible: distanceLabel && barWidth">' +
                '<div class="distance-legend-label"  data-bind="text: distanceLabel"></div>' +
                '<div class="distance-legend-scale-bar"  data-bind="style: { width: barWidth + \'px\', left: ((' + baseWidth + '- barWidth) / 2) + \'px\' }"></div>' +
                '</div>';
  }

  // 加载比例尺视图
  loadView(testing, container, this);
  // loadView(distanceLegendTemplate, container, this);
  // loadView(require('fs').readFileSync(__dirname + '/../Views/DistanceLegend.html', 'utf8'), container, this);
};

// 比例尺构造器函数,非单例模式
DistanceLegendViewModel.create = function(options) {
  var result = new DistanceLegendViewModel(options);
  result.show(options.container);
  return result;
};

// 获取Cesium测距API
var geodesic = new EllipsoidGeodesic();
// 定义比例尺距离的数组
var distances = [
  1, 2, 3, 5,
  10, 20, 30, 50,
  100, 200, 300, 500,
  1000, 2000, 3000, 5000,
  10000, 20000, 30000, 50000,
  100000, 200000, 300000, 500000,
  1000000, 2000000, 3000000, 5000000,
  10000000, 20000000, 30000000, 50000000];

/**
     * 计算三维的比例尺
     * @param  {Object} DistanceLegendViewModel的实例
     * @param  {Object} 当前的场景对象
     *
     */
function updateDistanceLegendCesium(viewModel, scene) {
  // 如果没有开启比例尺的话,那么就直接返回
  if (!viewModel.enableDistanceLegend) {
    viewModel.barWidth = undefined;
    viewModel.distanceLabel = undefined;
    return;
  }
  // 获取当前时间戳
  var now = getTimestamp();

  if (now < viewModel._lastLegendUpdate + 250) {
    return;
  }

  viewModel._lastLegendUpdate = now;

  // 获取实际canvas的宽和高的像素
  var width = scene.canvas.clientWidth;
  var height = scene.canvas.clientHeight;

  // 获取摄像到屏幕的两端的射线
  var left = scene.camera.getPickRay(new Cartesian2((width / 2) | 0, height - 1));
  var right = scene.camera.getPickRay(new Cartesian2(1 + (width / 2) | 0, height - 1));

  // 获取球与摄像机屏幕射线的焦点坐标
  var globe = scene.globe;
  var leftPosition = globe.pick(left, scene);
  var rightPosition = globe.pick(right, scene);

  // 如果没有算出正确坐标,那么返回
  if (!defined(leftPosition) || !defined(rightPosition)) {
    viewModel.barWidth = undefined;
    viewModel.distanceLabel = undefined;
    return;
  }
  // 将笛卡尔坐标系转为大地坐标系
  var leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
  var rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);

  // 计算亮点的像素距离
  geodesic.setEndPoints(leftCartographic, rightCartographic);
  var pixelDistance = geodesic.surfaceDistance;

  // 找出第一个小于100像素的距离
  var maxBarWidth = 100;
  var distance;
  for (var i = distances.length - 1; !defined(distance) && i >= 0; --i) {
    if (distances[i] / pixelDistance < maxBarWidth) {
      distance = distances[i];
    }
  }

  // 如果距离大于1000转换单位为km,如果距离小于1000则为米
  if (defined(distance)) {
    var label;
    if (distance >= 1000) {
      label = (distance / 1000).toString() + ' km';
    } else {
      label = distance.toString() + ' m';
    }

    // 用距离除以像素,得出每个像素的比例尺
    viewModel.barWidth = (distance / pixelDistance) | 0;
    // 给viewModel赋值
    viewModel.distanceLabel = label;
  } else {
    viewModel.barWidth = undefined;
    viewModel.distanceLabel = undefined;
  }
}

// function updateDistanceLegendLeaflet(viewModel, map) {
//     var halfHeight = map.getSize().y / 2;
//     var maxPixelWidth = 100;
//     var maxMeters = map.containerPointToLatLng([0, halfHeight]).distanceTo(
//         map.containerPointToLatLng([maxPixelWidth, halfHeight]));

//     var meters = leaflet.control.scale()._getRoundNum(maxMeters);
//     var label = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';

//     viewModel.barWidth = (meters / maxMeters) * maxPixelWidth;
//     viewModel.distanceLabel = label;
// }

export default DistanceLegendViewModel;
