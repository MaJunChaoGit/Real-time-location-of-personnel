import supCamera from 'cesium/Scene/Camera';
import Cartesian3 from 'cesium/Core/Cartesian3';
import createGuid from 'cesium/Core/createGuid';
import carToDegrees from 'ex/src/carToDegrees';
class Camera extends supCamera {

  /**
   * Camera构造器函数
   * @Author   Mjc
   * @exports
   * @param    {[Object]}                 scene
   */
  constructor(scene) {
    super(scene);
  }

  /**
   * 获取当前视角高度的方法
   * @Author   Mjc
   * @exports
   * @param    {[int]}                 fixed [保留小数点后位数]
   * @return   {[int]}                 [视角的高度值]
   */
  getViewHeight(fixed) {
    let viewHeight = this.positionCartographic.height;
    viewHeight = fixed ? viewHeight.toFixed(parseInt(fixed, 0)) : viewHeight;
    return parseInt(viewHeight, 0);
  }

  /**
   * 通过传入一个camera对象，更新当前摄像机的位置
   * @exports
   * @param    {[Object]}                 options [position,direction,up,frustum]
   * @return   {[null]}
   */
  updateCamera(options) {
    this.setView({
      destination: options.position
    });
    this.loadFrustum(options.frustum);
  }

  /**
   * 保存摄像机的frustum参数
   * @Author   Mjc
   * @DateTime 2018-04-20T14:34:41+0800
   * @exports
   * @param    {[Object]}                 frustum camera的frustum对象
   * @return   {[Object]}                         保存后的frustum
   */
  saveFrustum(frustum) {
    let options = {};
    Object.assign(options, frustum);
    return options;
  }

  /**
   * 载入摄像机的frustum参数
   * @Author   Mjc
   * @DateTime 2018-04-20T14:34:41+0800
   * @exports
   * @param    {[Object]}                 frustum camera的frustum对象
   * @return   {[null]}
   */
  loadFrustum(frustum) {
    Object.assign(this.frustum, frustum);
  }

  /**
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {String}   id    被删除的定位框的id
   * @param    {Functon}  event 需要被移除的事件处理方法
   * @return   {Null}
   */
  _removeEvent(id, event) {
    global.viewer.entities.removeById(id);
    global.viewer.scene.postUpdate.removeEventListener(event);
  }

  /**
   * @Author   MJC
   * @DateTime 2018-10-06
   * @version  1.0.0
   * @param    {Number}   options.destination 最终飞行的定位位置，为笛卡尔坐标
   * @param    {Object}   options.orientation heading,pitch,roll三元数
   * @param    {Number}   options.duration    飞行经过的时间，单位为秒
   * @param    {Function} options.complete    飞行结束后的回调函数
   * @param    {Function} options.cancel      飞行取消时的回调函数
   * @return   {Null}
   * 带定位框的飞行定位方法
   */
  fly({
    destination,
    orientation,
    duration = 3,
    complete = () => {},
    cancel = () => {}
  }) {
    if (!destination) return;

    let _self = this;
    // 创建飞行定位框的id, 方便后续取消时的删除
    let id = createGuid();

    let event = function() {
      // 获取定位框的实体
      let entity = global.viewer.entities.getById(id);
      // 获取定位框的笛卡尔坐标
      let entityPosition = entity.position._value;
      // 获取定位框的当前的canvas坐标
      let canvasPosition = global.viewer.scene.cartesianToCanvasCoordinates(entityPosition);
      // 获取canvas坐标的摄像机射线
      let ray = _self.getPickRay(canvasPosition);
      // 将坐标转为笛卡尔坐标
      let pickPosition = global.viewer.scene.globe.pick(ray, global.viewer.scene);
      // 如果坐标在屏幕外的话，就返回
      if (!pickPosition || !canvasPosition) return;
      // 判断是否在球的背面方法
      if (Math.abs(pickPosition.x - entityPosition.x) > 2000 ||
        Math.abs(pickPosition.z - entityPosition.z) > 1000 ||
        Math.abs(pickPosition.y - entityPosition.y) > 2000) {
        entity.show = false;
      } else {
        entity.show = true;
      }
    };
    // 将控制定位框在地球背面时隐藏
    global.viewer.scene.postUpdate.addEventListener(event);

    // 对笛卡尔坐标进行转化，提取经度和纬度，防止绘制的定位框有悬浮高度
    let position = carToDegrees(destination);

    // 绘制定位框
    global.viewer.entities.add({
      id: id,
      position: Cartesian3.fromDegrees(position.lon, position.lat, 0),
      billboard: {
        image: './Assets/rect.png',
        show: true,
        width: document.body.clientWidth * 2, // 根据屏幕的大小进行延伸，防止穿帮
        height: document.body.clientWidth * 2
      }
    });

    _self.flyTo({
      destination: destination,
      orientation: orientation,
      duration: duration,
      complete: function() {
        complete();
        _self._removeEvent(id, event);
      },
      cancel: function() {
        cancel();
        _self._removeEvent(id, event);
      }
    });
  }
}

export default Camera;
