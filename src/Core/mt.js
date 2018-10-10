import defined from 'cesium/Core/defined';
import JulianDate from 'cesium/Core/JulianDate';
import Cartesian3 from 'cesium/Core/Cartesian3';
import ReferenceFrame from 'cesium/Core/ReferenceFrame';
import SampledPositionProperty from 'cesium/DataSources/SampledPositionProperty';

class MovingdTarget {
  constructor(viewer) {
    // 必须传入viewer对象
    if (!defined(viewer)) {
      throw new Error('需要viewer对象');
    }
  }

  /**
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   * @param    {Object} positions 数据经纬度时间的数组
   */
  addSample(positions) {
    if (!defined(positions)) {
      throw new Error('请传入正确的采样点对象');
    }

    let property = this.getProperty();
    positions.forEach(val => {
      // 获取当前位置的事件
      let time = JulianDate.fromDate(new Date(val.time));
      // 获取当前位置的采样点
      let position = Cartesian3.fromDegrees(val.lon, val.lat, val.height);
      property.addSample(time, position);
    });
    return property;
  }

  /**
   * 设置采样点坐标系
   * @param  {Boolean} reference          true: 惯性坐标系 false: 固定坐标系
   * @return {SampledPositionProperty}    采样点容器
   */
  getProperty(reference) {
    const REFERENCE = reference ? ReferenceFrame.INERTIAL : ReferenceFrame.FIXED;

    return new SampledPositionProperty(REFERENCE);
  }

};
export default MovingdTarget;
