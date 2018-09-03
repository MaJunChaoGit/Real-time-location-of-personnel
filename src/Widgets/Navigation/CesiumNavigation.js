import defined from 'cesium/Core/defined';
import DeveloperError from 'cesium/Core/DeveloperError';
import CesiumEvent from 'cesium/Core/Event';
import registerKnockoutBindings from './Core/registerKnockoutBindings';
import DistanceLegendViewModel from './ViewModels/DistanceLegendViewModel';
import NavigationViewModel from './ViewModels/NavigationViewModel';

/**
  * CesiumNavigation的构造器函数,为CesiumNavigation初始化
  * @alias CesiumNavigation
  * @constructor
  *
  * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
  */
/* eslint-disable no-unused-vars */
var CesiumNavigation = function(viewerCesiumWidget, el) {
  initialize.apply(this, arguments);

  this._onDestroyListeners = [];
};

CesiumNavigation.prototype.distanceLegendViewModel = undefined;
CesiumNavigation.prototype.navigationViewModel = undefined;
CesiumNavigation.prototype.navigationDiv = undefined;
CesiumNavigation.prototype.distanceLegendDiv = undefined;
CesiumNavigation.prototype.terria = undefined;
CesiumNavigation.prototype.container = undefined;
CesiumNavigation.prototype._onDestroyListeners = undefined;

CesiumNavigation.prototype.destroy = function() {
  if (defined(this.navigationViewModel)) {
    this.navigationViewModel.destroy();
  }
  if (defined(this.distanceLegendViewModel)) {
    this.distanceLegendViewModel.destroy();
  }

  if (defined(this.navigationDiv)) {
    this.navigationDiv.parentNode.removeChild(this.navigationDiv);
  }
  delete this.navigationDiv;

  if (defined(this.distanceLegendDiv)) {
    this.distanceLegendDiv.parentNode.removeChild(this.distanceLegendDiv);
  }
  delete this.distanceLegendDiv;

  if (defined(this.container)) {
    this.container.parentNode.removeChild(this.container);
  }
  delete this.container;

  for (var i = 0; i < this._onDestroyListeners.length; i++) {
    this._onDestroyListeners[i]();
  }
};

CesiumNavigation.prototype.addOnDestroyListener = function(callback) {
  if (typeof callback === 'function') {
    this._onDestroyListeners.push(callback);
  }
};

/**
 * CesiumNavigation的初始化方法
 * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
 * @param options
 */
function initialize(viewerCesiumWidget, options, el) {
  if (!defined(viewerCesiumWidget)) {
    throw new DeveloperError('CesiumWidget or Viewer is required.');
  }

  // 判断传入的是Viewer实例,还是一个Widget
  var cesiumWidget = defined(viewerCesiumWidget.cesiumWidget) ? viewerCesiumWidget.cesiumWidget : viewerCesiumWidget;

  // 往当前的容器中插入Navigation的DIV
  var container = document.createElement('div');
  container.className = 'cesium-widget';
  cesiumWidget.container.appendChild(container);

  // 初始化CesiumNavigation
  this.terria = viewerCesiumWidget;
  this.terria.options = (defined(options)) ? options : {};
  this.terria.afterWidgetChanged = new CesiumEvent();
  this.terria.beforeWidgetChanged = new CesiumEvent();

  this.container = container;

  // 注册Knockout,如果没有使用TerriaJS的话,可以移除这一句话
  registerKnockoutBindings();

  // 判断是否开启了比例尺功能
  if (!defined(this.terria.options.enableDistanceLegend) || this.terria.options.enableDistanceLegend) {
    // 如果开启的话创建DIV,并设置id为distanceLegendDiv
    // this.distanceLegendDiv = document.createElement('div');
    // this.distanceLegendDiv.setAttribute('id', 'distanceLegendDiv');
    // container.appendChild(this.distanceLegendDiv);

    // 创建一个DistanceLegendViewModel的实例,并开启监听
    this.distanceLegendViewModel = DistanceLegendViewModel.create({
      container: document.getElementById(el.distance),
      terria: this.terria,
      mapElement: container,
      enableDistanceLegend: true
    });

  }

  if ((!defined(this.terria.options.enableZoomControls) || this.terria.options.enableZoomControls) && (!defined(this.terria.options.enableCompass) || this.terria.options.enableCompass)) {
    // this.navigationDiv = document.createElement('div');
    // this.navigationDiv.setAttribute('id', 'navigationDiv');

    // .appendChild(this.navigationDiv);
    // Create the navigation controls.
    this.navigationViewModel = NavigationViewModel.create({
      container: document.getElementById(el.outring),
      terria: this.terria,
      enableZoomControls: true,
      enableCompass: true
    });
  } else if ((defined(this.terria.options.enableZoomControls) && !this.terria.options.enableZoomControls) && (!defined(this.terria.options.enableCompass) || this.terria.options.enableCompass)) {
    // this.navigationDiv = document.createElement('div');
    // this.navigationDiv.setAttribute('id', 'navigationDiv');
    // .appendChild(this.navigationDiv);
    // container.appendChild(this.navigationDiv);
    // Create the navigation controls.
    this.navigationViewModel = NavigationViewModel.create({
      container: document.getElementById(el.outring),
      terria: this.terria,
      enableZoomControls: false,
      enableCompass: true
    });
  } else if ((!defined(this.terria.options.enableZoomControls) || this.terria.options.enableZoomControls) && (defined(this.terria.options.enableCompass) && !this.terria.options.enableCompass)) {
    // this.navigationDiv = document.createElement('div');
    // this.navigationDiv.setAttribute('id', 'navigationDiv');
    // container.appendChild(this.navigationDiv);
    // .appendChild(this.navigationDiv);
    // Create the navigation controls.
    this.navigationViewModel = NavigationViewModel.create({
      container: document.getElementById(el.outring),
      terria: this.terria,
      enableZoomControls: true,
      enableCompass: false
    });
  } else if ((defined(this.terria.options.enableZoomControls) && !this.terria.options.enableZoomControls) && (defined(this.terria.options.enableCompass) && !this.terria.options.enableCompass)) {
    // this.navigationDiv.setAttribute("id", "navigationDiv");
    // container.appendChild(this.navigationDiv);
    // Create the navigation controls.
    //            this.navigationViewModel = NavigationViewModel.create({
    //                container: this.navigationDiv,
    //                terria: this.terria,
    //                enableZoomControls: false,
    //                enableCompass: false
    //            });
  }

}

export default CesiumNavigation;
