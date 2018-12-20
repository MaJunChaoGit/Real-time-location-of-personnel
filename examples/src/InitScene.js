import api from '../api/index';
import {
  Viewer,
  Ion,
  Cartesian3,
  Matrix4,
  HeadingPitchRoll,
  IonImageryProvider
} from 'source/index';
import Features from 'ex/src/Features';

class InitScene {

  constructor(el) {
    this.isComplete = false;
    // 返回一个Promise给视图,方便判断是否已经成功加载全部场景
    return new Promise(resolve => {
      this.loadGlobe(el)
        .then(viewer => {
          global.viewer = viewer;
          if (process.env.NODE_ENV === 'development') viewer.scene.debugShowFramesPerSecond = true;
          this.focusScene(viewer, resolve);
        });
    });
  }

  /**
   * 控制场景视角中心方法
   * @Author   MJC
   * @DateTime 2018-12-20
   * @version  1.0.0
   * @param    {[type]}   viewer 加载场景初始位置
   * @return   {[type]}          [description]
   */
  focusScene(viewer, resolve) {
    // 设置相机的初始位置
    let initialPosition = Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821, 753);
    /* eslint-disable new-cap */
    let initialOrientation = new HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
    // 定位至场景初始位置
    global.viewer.scene.camera.fly({
      // 目的地
      destination: initialPosition,
      // 飞行时间
      duration: 3,
      complete: () => {
        setTimeout(() => {
          global.viewer.scene.camera.flyTo({
            // 目的地
            destination: initialPosition,
            // 飞行时间
            duration: 2,
            orientation: initialOrientation,
            endTransform: Matrix4.IDENTITY,
            complete: () => {
              // 设置图层颜色
              viewer.setLayersStyles({
                saturation: 0,
                brightness: 0.36
              });
              // 设置高光效果
              viewer.setBloomStyles({});
              // 开启光照效果
              viewer.scene.globe.enableLighting = true;
              this.isComplete = false;
              resolve(this.isComplete);
            }
          });
        }, 300);
      }
    });
  }
  /**
   * 加载地球异步方法
   * @Author   MJC
   * @DateTime 2018-12-20
   * @version  1.0.0
   * @param    {String}   el 挂载地球的HTML元素ID
   * @return   {Promise}
   */
  async loadGlobe(el) {
    let viewer = null;
    Ion.defaultAccessToken = api.IonKey;
    try {
      viewer = await new Viewer(el, {
        animation: false, // 是否创建动画小器件，左下角仪表
        baseLayerPicker: false, // 是否显示图层选择器
        fullscreenButton: false, // 是否显示全屏按钮
        geocoder: false, // 是否显示geocoder小器件，右上角查询按钮
        homeButton: false, // 是否显示Home按钮
        infoBox: false, // 是否显示信息框
        sceneModePicker: false, // 是否显示3D/2D选择器
        selectionIndicator: false, // 是否显示选取指示器组件
        timeline: false, // 是否显示时间轴
        navigationHelpButton: false, // 是否显示右上角的帮助按钮
        useDefaultRenderLoop: true, // 如果需要控制渲染循环，则设为true
        automaticallyTrackDataSourceClocks: true, // 自动追踪最近添加的数据源的时钟设置
        contextOptions: undefined, // 传递给Scene对象的上下文参数（scene.options）
        showRenderLoopErrors: true, // 如果设为true，将在一个HTML面板中显示错误信息
        imageryProvider: new IonImageryProvider({ assetId: 4 })
      });
    } catch (e) {
      // statements
      console.log('加载地球出现BUG');
    }
    // 隐藏版权信息
    viewer.creditControll();

    try {
      // 新建倾斜摄影对象
      const feature = new Features(viewer, api.newYork);
    } catch (e) {
      // statements
      console.log('加载倾斜摄影出现BUG');
    }
    return viewer;
  }

}

export default InitScene;
