import defined from 'cesium/Core/defined';
import Ray from 'cesium/Core/Ray';
import Cartesian3 from 'cesium/Core/Cartesian3';
import Cartographic from 'cesium/Core/Cartographic';
import SceneMode from 'cesium/Scene/SceneMode';

var Utils = {};

var unprojectedScratch = new Cartographic();
var rayScratch = new Ray();

/**
     * 获取当前摄像机的焦点
     * @param {Viewer|Widget} CesiumWidget的实例
     * @param {boolean} 如果为true的话就使用世界坐标，否则的话就使用投影坐标系
     * @param {Cartesian3} 存储的对象
     * @return {Cartesian3} 如果没有提供任何追踪的实体,或者没有任何焦点，则是undefined
     */
Utils.getCameraFocus = function(terria, inWorldCoordinates, result) {
  // 获取场景和摄像机
  var scene = terria.scene;
  var camera = scene.camera;
  // 判断当前是否正在进行变换
  if (scene.mode === SceneMode.MORPHING) {
    return undefined;
  }
  // 如果用户没有传入存储的变量，那么新建一个笛卡尔
  if (!defined(result)) {
    result = new Cartesian3();
  }

  // 判断当前是否有追踪的实体
  if (defined(terria.trackedEntity)) {
    // 获取当前时间上这个目标实体的位置，并存入result
    result = terria.trackedEntity.position.getValue(terria.clock.currentTime, result);
  } else {
    // 获取相机在世界坐标的位置
    rayScratch.origin = camera.positionWC;
    // 获取相机在世界坐标的方向
    rayScratch.direction = camera.directionWC;
    // 获取摄像机射线到球上的交叉点位置
    result = scene.globe.pick(rayScratch, scene, result);
  }
  // 如果找不到位置，直接return undefined
  if (!defined(result)) {
    return undefined;
  }

  // 如果不是3D模式的话执行转换
  if (scene.mode === SceneMode.SCENE2D || scene.mode === SceneMode.COLUMBUS_VIEW) {

    // 将改点转为相机的参考系坐标点
    result = camera.worldToCameraCoordinatesPoint(result, result);
    // 根据用户传入是否使用世界坐标
    if (inWorldCoordinates) {
      result = scene.globe.ellipsoid.cartographicToCartesian(scene.mapProjection.unproject(result, unprojectedScratch), result);
    }
  } else {
    // 根据用户传入是否使用世界坐标
    if (!inWorldCoordinates) {
      // 将改点转为相机的参考系坐标点
      result = camera.worldToCameraCoordinatesPoint(result, result);
    }
  }

  return result;
};

export default Utils;
