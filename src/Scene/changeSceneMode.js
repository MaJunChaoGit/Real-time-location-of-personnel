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
    _saveData['camera'] = scene.camera.setOptions();

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
    _scene = scene ? scene : global.viewer.scene;
    _camera = _scene.camera;
    _sceneMode = _scene.mode;
    /* eslint-disable no-unused-vars */
    _scene.morphComplete.addEventListener(function(__scene, __time) {
      _camera.updateCamera(_saveData.camera);
    });
  }

  return changeSceneMode;
})();

