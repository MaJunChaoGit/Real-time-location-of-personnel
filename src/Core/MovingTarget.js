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
import LabelStyle from 'cesium/Scene/LabelStyle';
import VerticalOrigin from 'cesium/Scene/VerticalOrigin';
import Cartesian2 from 'cesium/Core/Cartesian2';
import Color from 'cesium/Core/Color';
import createGuid from 'cesium/Core/createGuid';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import EventHelper from 'source/Core/EventHelper';
import InfoBox from 'source/Core/InfoBox';
import Cesium3DTileFeature from 'cesium/Scene/Cesium3DTileFeature';
class MovingdTarget {
  constructor(viewer, data) {
    // 必须传入viewer对象
    if (!defined(viewer)) {
      throw new Error('需要viewer对象');
    }
    this.viewer = viewer;
    this.data = data;

    this.registerEvent();
    return this.createEntity(data);
  }

  /**
   * 线性插值添加采样点
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
   * 创建target的实体
   * @Author   Hybrid
   * @DateTime 2018-10-10
   * @version  1.0.0
   * @param    {Object}
   * @return   {Entity}
   */
  createEntity(data) {
    let property = this.addSample(data.position);
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
        color: Color.BLUE,
        pixelSize: 5,
        distanceDisplayCondition: new DistanceDisplayCondition(5e6, 1e10)
      },
      model: {
        uri: '../Assets/j11/j11.gltf',
        minimumPixelSize: 75,
        maximumScale: 20000,
        distanceDisplayCondition: new DistanceDisplayCondition(0, 5e6)
      },
      path: {
        resolution: 9999,
        material: new PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: Color.BLUE
        }),
        width: 10,
        leadTime: 0,
        trailTime: 300,
        distanceDisplayCondition: new DistanceDisplayCondition(0, 0.5e7)
      },
      label: {
        font: '16px 黑体',
        text: '车辆编号:' + data.id,
        fillColor: Color.SKYBLUE,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        style: LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: VerticalOrigin.TOP,
        distanceDisplayCondition: new DistanceDisplayCondition(0, 0.5e7),
        pixelOffset: new Cartesian2(10, -25)
      }
    };
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

  registerEvent() {
    let event = new EventHelper(this.viewer);
    event.setEvent((movement) => {
      // 获取屏幕的坐标
      let screenPosition = movement.position;
      // 获取屏幕坐标点击后的实体
      let pickEntity = this.viewer.scene.pick(screenPosition);
      // 如果没有目标被选中则退出
      if (!pickEntity || pickEntity instanceof Cesium3DTileFeature) return;
      // 获取实体
      let entity = pickEntity.id;
      // 如果该目标没有标牌的话就创建标牌
      if (!document.querySelector('#' + entity.id)) {
        // 创建标牌等
        this.infobox = new InfoBox(entity.id, ['position', 'type', 'ascription']);
        this.infobox.setFeature((key) => {
          return entity.options[key];
        });
        // 绑定标牌和实体
        // this.bindElement(entity.id);
      }
      this.infobox.show(true);
    }, ScreenSpaceEventType.LEFT_CLICK);
  }
};
export default MovingdTarget;
