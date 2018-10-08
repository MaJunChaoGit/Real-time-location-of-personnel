import defined from 'cesium/Core/defined';
import SceneMode from 'cesium/Scene/SceneMode';

export default (()=>{
  let _scene = {};
  let _camera = {};
  let _sceneMode = {};
  let _saveData = {};
  /**
	 * [changeSceneMode description]
	 * 切换当前的视图显示模式，如果是3D模式则切换到2D,反之亦然
	 * @Author   Mjc
	 * @DateTime 2018-04-19T15:22:05+0800
	 * @exports
	 * @param    {[type]}                 scene 场景对象
	 * @return   {[type]}
	 */
  function changeSceneMode(scene) {

    if (!defined(scene)) {
      throw new Error('需要传入一个scene');
    }

    initArgs(scene);

    _saveData['sceneMode'] = _sceneMode;
    _saveData['camera'] = setOptions();

    _saveData.sceneMode === SceneMode.SCENE3D ? _scene.morphTo2D(1.0) : _scene.morphTo3D(1.0);

  }

  /**
   * @Author   MJC
   * @DateTime 2018-10-06
   * @version  1.0.0
   * @param    {Object}   scene 整个场景对象
   * @return   {Null}
   * 初始化摄像机监听事件
   */
  function initArgs(scene) {
    _scene = scene ? scene : global.ev.scene;
    _camera = _scene.camera;
    _sceneMode = _scene.mode;
    /* eslint-disable no-unused-vars */
    _scene.morphComplete.addEventListener(function(__scene, __time) {
      _camera.updateCamera(_saveData.camera);
    });
  }

  /**
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * 设置摄像机参数映射的对象方法
   */
  function setOptions() {
    // 摄像机更新必备的4个参数
    let options = {
      position: null,
      direction: _camera.direction.clone(),
      up: _camera.up.clone(),
      frustum: _camera.saveFrustum(_camera.frustum.clone())
    };

    // 三维模式下直接获取摄像机的世界坐标就好了
    if (_sceneMode === SceneMode.SCENE3D) {
      options.position = _camera.positionWC.clone();
    } else {
      // 二维模式下需要将摄像机的坐标进行反投影
      var cartographic = _scene.mapProjection.unproject(_camera.position);
      // 获取的大地坐标高度不对，需要重新计算
      cartographic.height = _camera.getViewHeight();
      // 将大地坐标转为笛卡尔坐标
      options.position = _scene.mapProjection.ellipsoid.cartographicToCartesian(cartographic);
    }

    return options;
  }

  return changeSceneMode;
})();

