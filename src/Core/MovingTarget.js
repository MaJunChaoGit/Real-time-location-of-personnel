import defined from 'cesium/Core/defined';
import CustomDataSource from 'cesium/DataSources/CustomDataSource';
import JulianDate from 'cesium/Core/JulianDate';
import Color from 'cesium/Core/Color';
import ScreenSpaceEventHandler from 'cesium/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
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

// import carToDegrees from '../carToDegrees';
// import { addClass, on, off } from '../dom';
// import css from './style.css';

const POINT_COLOR = {
  'ship': Color.BLUE
};
const MODEL_URL = {
  'ship': './Assets/ship/ys.gltf'
};
const PATH_COLOR = {
  'ship': Color.BLUE
};
const TRAIL_TIME = {
  'ship': 300
};
const RESOLUTION = {
  'ship': 9999
};

class MovingdTarget {
  constructor(viewer) {
    // 检测是否注册scene进入模块
    if (!defined(viewer)) {
      throw new Error('需要viewer对象');
    }

    this._viewer = viewer;
    this._clock = this._viewer.clock;
    this._scene = this._viewer.scene;
    this._canvas = this._scene.canvas;
    this._camera = this._viewer.camera;
    this._entities = {};
    this._tempEventCollection = {};
    this._dataSource = {};
    this._handler = {};
  }

  init() {
    this._trackedEntity = {};
    this._dataSource = new CustomDataSource();
    this._entities = this._dataSource.entities;
    this._viewer.dataSources.add(this._dataSource);
    this._handler = new ScreenSpaceEventHandler(this._canvas);
  }

  /**
   * 设置摄像机位置
   * @param {Double} lon    [经度]
   * @param {Double} lat    [纬度]
   * @param {Double} height [高度]
   */
  // setView(position) {
  //   if (!defined(position)) {
  //     throw new Error('需要传入包含经度, 纬度, 高度的对象');
  //   }
  //   this._camera.setView({
  //     destination: Cartesian3.fromDegrees(position.lon, position.lat, position.height)
  //   });
  // }
  // /**
  //  * 设置演示动画的开始与结束时间
  //  * @param {String} start [开始时间]
  //  * @param {String} end   [结束时间]
  //  */
  // setLifyCircle(start, stop) {
  //   if (!defined(start) && !defined(stop)) throw new Error('需要传入日期字符串,格式为yyyy-mm-dd hh:mm:ss');

  //   start = JulianDate.fromDate(new Date(start));
  //   stop = JulianDate.fromDate(new Date(stop));

  //   this._clock.shouldAnimate = true;
  //   this._clock.startTime = start.clone();
  //   this._clock.currentTime = start.clone();
  //   this._clock.endTime = stop.clone();
  // }
  /**
   * 设置动画的播放速率
   * @param {Number} speed [动画播放速率]
   */
  setMutiplier(speed) {
    this._clock.multiplier = speed ? speed : 5;
  }
  /**
   * 添加采样点
   * @param {Object} data [description]
   */
  addSample(data, property) {
    if (!defined(data)) {
      throw new Error('请传入正确的采样点对象');
    }

    data.forEach(val => {
      let time = JulianDate.fromDate(new Date(val.time));
      let position = Cartesian3.fromDegrees(val.lon, val.lat, val.height);
      property.addSample(time, position);
    });
    return property;
  }
  /**
   * 设置采样点坐标系
   * @param  Boolean reference          true: 惯性坐标系 false: 固定坐标系
   * @return SampledPositionProperty    采样点容器
   */
  getProperty(reference) {
    const REFERENCE = reference ? ReferenceFrame.INERTIAL : ReferenceFrame.FIXED;

    return new SampledPositionProperty(REFERENCE);
  }
  /**
   * 创建一个实体单位
   * @param  {Object} options 需要配置的参数
   * @return {Object}         实体对象
   */
  createEntity(options, position) {
    return {
      type: options.type,
      country: options.country,
      id: options.id,
      position: position,
      orientation: new VelocityOrientationProperty(position),
      availability: new TimeIntervalCollection([new TimeInterval({
        start: JulianDate.fromDate(new Date(options.startTime)),
        stop: JulianDate.fromDate(new Date(options.endTime))
      })]),
      point: {
        color: POINT_COLOR[options.type],
        pixelSize: 5,
        distanceDisplayCondition: new DistanceDisplayCondition(5e6, 1e10)
      },
      model: {
        uri: MODEL_URL[options.type],
        minimumPixelSize: 75,
        maximumScale: 20000,
        distanceDisplayCondition: new DistanceDisplayCondition(0, 5e6)
      },
      path: {
        resolution: RESOLUTION[options.type],
        material: new PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: PATH_COLOR[options.type]
        }),
        width: 10,
        leadTime: 0,
        trailTime: TRAIL_TIME[options.type],
        distanceDisplayCondition: new DistanceDisplayCondition(0, 0.5e7)
      },
      label: {
        font: '16px 黑体',
        text: '编号:' + options.id,
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
  registerEvent() {
    this._handler.setInputAction(m => {
      // 获取屏幕的坐标
      let screenPosition = m.position;
      // 获取屏幕坐标点击后的实体
      let pickEntity = this._scene.pick(screenPosition);
      // 如果没有目标被选中则退出
      if (!pickEntity) return;
      // 获取实体
      let entity = pickEntity.id;
      // 如果该目标没有标牌的话就创建标牌
      if (!document.querySelector('#' + entity.id + '')) {
        // 创建标牌等
        this.createBillboard(entity);
        on(document.querySelector('#' + entity.id + 'Icon'), 'click', () => {
          document.querySelector('#' + entity.id).remove();
          this._scene.postUpdate.removeEventListener(this._tempEventCollection[entity.id]);
        });
        // 绑定标牌和实体
        this.bindElement(entity.id);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    this._handler.setInputAction(m => {
      let screenPosition = m.position;
      let pickEntity = this._scene.pick(screenPosition);
      if (pickEntity && pickEntity.id) {
        let entity = this._trackedEntity[pickEntity.id.id];
        if (entity) {
          this._viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(120.16, 20, 1500000.0)
          });
          this._viewer.trackedEntity = undefined;
          delete this._trackedEntity[pickEntity.id.id];
        } else {
          this._viewer.trackedEntity = pickEntity.id;
          this._trackedEntity[pickEntity.id.id] = pickEntity.id;
        }
      }
    }, ScreenSpaceEventType.RIGHT_CLICK);
  }
  createBillboard(entity) {
    if (!entity) return;

    let id = entity.id;

    const options = [
      {
        id: id,
        className: 'movingTargetContainer bgColor borderColor shadowColor br4 m8 fr',
        parentNode: 'body'
      },
      {
        id: id + 'Header',
        className: 'movingTargetHeader',
        parentNode: '#' + id
      },
      {
        id: id + 'Icon',
        className: 'movingTargetIcon',
        parentNode: '#' + id + 'Header'
      },
      {
        id: id + 'Body',
        className: 'movingTargetBody',
        parentNode: '#' + id
      }
    ];

    options.forEach(val => {
      let el = document.createElement('div');
      el.id = val.id;
      addClass(el, val.className);
      document.querySelector(val.parentNode).appendChild(el);
    });
    this.setText(entity, document.querySelector('#' + id + 'Body'));
  }
  setText(entity, el) {
    let text = [
      {
        type: 'id',
        text: '编号 : '
      },
      {
        type: 'country',
        text: '国家地区  : '
      },
      {
        type: 'type',
        text: '类型  : '
      },
      {
        type: 'time',
        text: '位置时间: '
      }
    ];
    text.forEach(val => {
      let p = document.createElement('p');
      p.textContent = val.text + entity[val.type];
      el.appendChild(p);
    });
  }
  bindElement(id) {
    let that = this;
    let htmlOverlay = document.getElementById(id);
    let scratch = new Cartesian2();
    // 绑定事件
    let event = function() {
      let time = that._clock._currentTime;
      let position = that._entities.getById(id).position.getValue(time);
      let canvasPosition = that._scene.cartesianToCanvasCoordinates(position, scratch);
      if (position && canvasPosition) {
        htmlOverlay.style.top = canvasPosition.y + 'px';
        htmlOverlay.style.left = canvasPosition.x + 'px';
        let timeText = that.getTime(JulianDate.toDate(time));
        // 更新div文本中的位置时间信息
        htmlOverlay.children[1].children[3].innerText = ('位置时间 : ' + timeText);
      } else {
        // 若位置点消耗完,则删除div
        document.getElementById(id).remove();
        // 移除绑定
        scene.postUpdate.removeEventListener(that._tempEventCollection[id]);
      }
    };
    // 存储监听事件 供div移除时使用
    this._tempEventCollection[id] = event;
    // 在cesium场景中添加绑定
    this._scene.postUpdate.addEventListener(event);
  }
  /**
  * [getTime 转化js时间格式]
  * @param  {[type]} date [js时间类]
  * @return {[type]}      [description]
  */
  getTime(date) {
    let Y = date.getFullYear();
    let M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    let D = date.getDate();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    return Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s;
  }

  start(data) {
    this.init();
    this.setView(data.center);

    this.setLifyCircle(data.overallStarttime, data.overallEndtime);

    this.setMutiplier(data.multiplier);

    // let arr = Cartesian3.unpackArray(data.data[0].position);
    // let str = '';
    // arr.forEach(val => {
    //   let pos = carToDegrees(val);
    //   str += `{ lon: ${pos.lon}, lat: ${pos.lat}, height: ${pos.height} },\n`;
    // });
    // console.log(str);

    data.data.forEach(val => {
      let position = this.addSample(val.position, this.getProperty());
      this._entities.add(this.createEntity(val, position));
    });

    this.registerEvent();
  }
  stop() {
    let that = this;

    for (let item in that._tempEventCollection) {
      that._scene.postUpdate.removeEventListener(that._tempEventCollection[item]);
      if (document.getElementById(item)) {
        document.getElementById(item).remove();
      }
    }
    that._entities.removeAll();
    that._handler.destroy();
    that._handler = null;
    that._trackedEntity = {};
  }
}

export default MovingdTarget;
