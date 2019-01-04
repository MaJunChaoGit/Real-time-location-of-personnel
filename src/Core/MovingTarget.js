import defined from 'cesium/Core/defined';
import JulianDate from 'cesium/Core/JulianDate';
import Cartesian3 from 'cesium/Core/Cartesian3';
import ReferenceFrame from 'cesium/Core/ReferenceFrame';
import SampledPositionProperty from 'cesium/DataSources/SampledPositionProperty';
import VelocityOrientationProperty from 'cesium/DataSources/VelocityOrientationProperty';
import TimeIntervalCollection from 'cesium/Core/TimeIntervalCollection';
import TimeInterval from 'cesium/Core/TimeInterval';
import DistanceDisplayCondition from 'cesium/Core/DistanceDisplayCondition';
import PolylineGlowMaterialProperty from 'cesium/DataSources/PolylineGlowMaterialProperty';
// import LabelStyle from 'cesium/Scene/LabelStyle';
// import VerticalOrigin from 'cesium/Scene/VerticalOrigin';
// import Cartesian2 from 'cesium/Core/Cartesian2';
import Color from 'cesium/Core/Color';
import createGuid from 'cesium/Core/createGuid';
import NearFarScalar from 'cesium/Core/NearFarScalar';
import TypeEnum from 'source/Core/TypeEnum';
// import InfoBox from 'source/Core/InfoBox';
import Entity from 'cesium/DataSources/Entity';

class MovingTarget extends Entity {
  constructor(data) {
    // 必须传入viewer对象
    if (!defined(data)) {
      throw new Error('需要data对象');
    }
    super(MovingTarget.createEntity(data));

    // 创建标牌等
    // this.infobox = new InfoBox(this.data.id, ['id', 'phone', 'type', 'ascriptions', 'time']);
  }
  /**
   * 线性插值添加采样点
   * @Author   MJC
   * @DateTime 2018-10-10
   * @version  1.0.0
   * @param    {Object} positions 数据经纬度时间的数组
   */
  static addSample(positions) {
    if (!defined(positions)) {
      throw new Error('请传入正确的采样点对象');
    }

    let property = MovingTarget.getProperty();
    positions.forEach(val => {
      // 获取当前位置的事件
      let time = JulianDate.fromDate(new Date(val.time));
      // 获取当前位置的采样点
      let position = Cartesian3.fromDegrees(val.lon, val.lat, val.height);
      property.addSample(time, position);
    });
    return property;
  }
  // let timeValue = crtTimeFtt(global.viewer.clock._currentTime);
  /**
   * 创建target的实体
   * @Author   Hybrid
   * @DateTime 2018-10-10
   * @version  1.0.0
   * @param    {Object}
   * @return   {Entity}
   */
  static createEntity(data) {
    let type = data.options.type;
    // 翻译一下类型 e.g 1 = 家用车
    data.options.type = TypeEnum[type].name;
    // 对坐标位置进行采样点
    let property = MovingTarget.addSample(data.timePositions);
    return {
      id: data.id ? data.id : createGuid(),
      options: data.options,
      position: property,
      orientation: new VelocityOrientationProperty(property),
      availability: new TimeIntervalCollection([new TimeInterval({
        start: JulianDate.fromDate(new Date(data.startTime)),
        stop: JulianDate.fromDate(new Date(data.endTime))
      })]),
      point: {
        color: TypeEnum[type].color,
        pixelSize: 15,
        distanceDisplayCondition: new DistanceDisplayCondition(1500, 1e10),
        outlineColor: Color.WHITE,
        outlineWidth: 3,
        scaleByDistance: new NearFarScalar(2000, 1.0, 200000, 0.2)
      },
      model: {
        uri: TypeEnum[type].uri,
        minimumPixelSize: TypeEnum[type].minimumPixelSize,
        maximumScale: TypeEnum[type].maximumScale,
        scale: TypeEnum[type].scale,
        distanceDisplayCondition: new DistanceDisplayCondition(0, 1500),
        silhouetteColor: TypeEnum[type].color,
        silhouetteSize: 2
      },
      path: {
        resolution: 400,
        material: new PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: TypeEnum[type].color
        }),
        width: 10,
        leadTime: 0,
        trailTime: 600,
        distanceDisplayCondition: new DistanceDisplayCondition(0, 200000),
        show: false
      }
      // label: {
      //   font: '12px 黑体',
      //   text: '编号:' + data.id.substring(0, 8),
      //   fillColor: TypeEnum[type].color,
      //   outlineColor: Color.BLACK,
      //   outlineWidth: 2,
      //   style: LabelStyle.FILL_AND_OUTLINE,
      //   verticalOrigin: VerticalOrigin.TOP,
      //   distanceDisplayCondition: new DistanceDisplayCondition(500, 200000),
      //   pixelOffset: new Cartesian2(10, -25)
      // }
    };
  }
  /**
   * 设置采样点坐标系
   * @param  {Boolean} reference          true: 惯性坐标系 false: 固定坐标系
   * @return {SampledPositionProperty}    采样点容器
   */
  static getProperty(reference) {
    const REFERENCE = reference ? ReferenceFrame.INERTIAL : ReferenceFrame.FIXED;

    return new SampledPositionProperty(REFERENCE);
  }
  /**
   * 动目标新增坐标方法
   * @Author   MJC
   * @DateTime 2019-01-04
   * @version  1.0.0
   * @param    {Array}   positions [description]
   * @return   {[type]}             [description]
   */
  pushPositions(positions) {
    positions.forEach(val => {
      // 获取当前位置的事件
      let time = JulianDate.fromDate(new Date(val.time));
      // 获取当前位置的采样点
      let position = Cartesian3.fromDegrees(val.lon, val.lat, val.height);
      this.positions.addSample(time, position);
    });
  }
};
export default MovingTarget;
