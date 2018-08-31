import supCamera from 'cesium/Scene/Camera';

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
}

export default Camera;
