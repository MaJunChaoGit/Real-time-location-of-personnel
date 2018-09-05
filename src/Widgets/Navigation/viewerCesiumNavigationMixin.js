import defined from 'cesium/Core/defined';
import defineProperties from 'cesium/Core/defineProperties';
import DeveloperError from 'cesium/Core/DeveloperError';
import CesiumNavigation from './CesiumNavigation';
import './Styles/cesium-navigation.less';

/**
  * 向Viewer组件中混入一个指南针组件，该方法的使用方式是像一个参数一样传入，
  * 而不是通过方法名字直接调用
  *
  * @exports viewerCesiumNavigationMixin
  *
  * @param {Viewer} viewer The viewer instance.
  * @param {{}} options The options.
  *
  * @exception {DeveloperError} viewer is required.
  *
  * @example
  * var viewer = new Cesium.Viewer('cesiumContainer');
  * viewer.extend(viewerCesiumNavigationMixin);
  */
function viewerCesiumNavigationMixin(viewer, options) {
  if (!defined(viewer)) {
    throw new DeveloperError('viewer is required.');
  }
  // 新建一个cesiumNavigation的实例对象
  var cesiumNavigation = init(viewer, options);

  cesiumNavigation.addOnDestroyListener((function(viewer) {
    return function() {
      delete viewer.cesiumNavigation;
    };
  })(viewer));

  defineProperties(viewer, {
    cesiumNavigation: {
      configurable: true,
      get: function() {
        return viewer.cesiumWidget.cesiumNavigation;
      }
    }
  });
}

/**
  * 新建一个cesiumNavigation的方法,实际利用apply调用init方法
  * @param {CesiumWidget} cesiumWidget The cesium widget instance.
  * @param {{}} options The options.
  */
/* eslint-disable no-unused-vars */
viewerCesiumNavigationMixin.mixinWidget = function(cesiumWidget, options) {
  return init.apply(undefined, arguments);
};

/**
  *
  * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
  * @param {{}} options the options
  */
var init = function(viewerCesiumWidget, options, el) {
  // 新建一个一个cesiumNavigation实例
  var cesiumNavigation = new CesiumNavigation(viewerCesiumWidget, options, el);
  // 获取viewer中的cesiumWidget或者直接传入cesiumWidger
  var cesiumWidget = defined(viewerCesiumWidget.cesiumWidget) ? viewerCesiumWidget.cesiumWidget : viewerCesiumWidget;

  // 为cesiumWidget中添加cesiumNavigation对象
  defineProperties(cesiumWidget, {
    cesiumNavigation: {
      configurable: true,
      get: function() {
        return cesiumNavigation;
      }
    }
  });

  // IIFEcesiumNavigation的摧毁事件
  cesiumNavigation.addOnDestroyListener((function(cesiumWidget) {
    return function() {
      delete cesiumWidget.cesiumNavigation;
    };
  })(cesiumWidget));

  return cesiumNavigation;
};

export default viewerCesiumNavigationMixin;
