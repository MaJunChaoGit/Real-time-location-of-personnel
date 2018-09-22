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

  // 初始化参数
  function initArgs(scene) {
    _scene = scene ? scene : global.ev.scene;
    _camera = _scene.camera;
    _sceneMode = _scene.mode;
    /* eslint-disable no-unused-vars */
    _scene.morphComplete.addEventListener(function(__scene, __time) {
      _camera.updateCamera(_saveData.camera);
    });
  }

  // 设置摄像机参数映射的对象方法
  function setOptions() {

    let options = {
      position: null,
      direction: _camera.direction.clone(),
      up: _camera.up.clone(),
      frustum: _camera.saveFrustum(_camera.frustum.clone())
    };

    if (_sceneMode === SceneMode.SCENE3D) {
      options.position = _camera.positionWC.clone();
    } else {
      var cartographic = _scene.mapProjection.unproject(_camera.position);
      cartographic.height = _camera.getViewHeight();
      options.position = _scene.mapProjection.ellipsoid.cartographicToCartesian(cartographic);
    }

    return options;
  }

  return changeSceneMode;
})();

