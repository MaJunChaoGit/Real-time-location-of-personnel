import Cartographic from 'cesium/Core/Cartographic';
import defined from 'cesium/Core/defined';
import Math from 'cesium/Core/Math';

export default function carToDegrees(cartesian) {

  if (!defined(cartesian)) {
    throw new Error('需要传入一个笛卡尔坐标');
  }
  var cartographic = Cartographic.fromCartesian(cartesian);

  var longitude = Math.toDegrees(cartographic.longitude);

  var latitude = Math.toDegrees(cartographic.latitude);

  var height = cartographic.height;

  return { lon: longitude, lat: latitude, height: height };
}
