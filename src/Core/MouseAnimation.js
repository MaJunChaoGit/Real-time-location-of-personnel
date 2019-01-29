import EventHelper from './EventHelper.js';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import JulianDate from 'cesium/Core/JulianDate';
import Math from 'cesium/Core/Math';
/**
 * 鼠标动画类
 */
class MouseAnimation {
  constructor(viewer, second = 2) {
    this.viewer = viewer;
    this.second = second;
    this.middleWheelFlag = false;
    this.wheelTime = JulianDate.now();
    this.container = this.initContainer();
    this.wheelEvent = this.initWheelEvent();
  }
  /**
   * 初始化图片的容器,并且创建图片为背景
   * @Author   MJC
   * @DateTime 2019-01-29
   * @version  1.0.0
   * @param    {Viewer}   viewer Viewer对象
   * @return   {Node}          Element
   */
  initContainer() {
    let imgString = 'data:image/png;base64,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';
    let container = document.createElement('div');
    container.className = 'cesium-viewer-zoomIndicatorContainer';
    this.viewer._element.appendChild(container);

    let imgContainer = document.createElement('div');
    imgContainer.style.position = 'absolute';
    imgContainer.style.width = '48px';
    imgContainer.style.height = '48px';
    imgContainer.style.backgroundSize = 'contain';
    imgContainer.style.pointerEvents = 'none';
    imgContainer.style.opacity = '0';
    imgContainer.style.backgroundImage = 'url(' + imgString + ')';
    imgContainer.style.transition = 'opacity 0.2s ease-out';
    container.appendChild(imgContainer);
    return imgContainer;
  }

  /**
   * 初始化鼠标滚轮事件
   * @Author   MJC
   * @DateTime 2019-01-29
   * @version  1.0.0
   * @return   {[type]}   [description]
   */
  initWheelEvent() {
    let wheelEvent = new EventHelper(this.viewer);
    wheelEvent.setEvent(() => {
      // this.viewer.clock.onTick.removeEventListener(this.opacityHandle.bind(this), this.viewer);
      // 获取当前鼠标位置
      let windowPosition = this.viewer.scene.screenSpaceCameraController._aggregator.currentMousePosition;
      // 同步容器的位置
      this.container.style.top = windowPosition.y - 24 + 'px';
      this.container.style.left = windowPosition.x - 24 + 'px';
      // 获取当前滚轮事件触发的时间
      this.wheelTime = JulianDate.now();
      // 开关开启,标记已经触发了事件
      this.middleWheelFlag = true;
      // 显示容器
      this.container.style.opacity = '1';
      this.initOpacityEffectEvent();
    }, ScreenSpaceEventType.WHEEL);

    return wheelEvent;
  }
  opacityHandle() {
    // 获取当前时间
    let time = JulianDate.now();
    // 如果没有被滚动,直接返回
    if (!this.middleWheelFlag) {
      return;
    }
    // 获取滚动的时间, 与现在时间做对比
    let diff = JulianDate.secondsDifference(time, this.wheelTime);
    // 计算出相差的毫秒数
    diff *= this.second;
    let opacity = 1 - diff;
    // 计算出透明度
    opacity = Math.clamp(opacity, 0, 1);
    // 如果已经隐藏了 就关掉开关
    if (opacity === 0) {
      this.middleWheelFlag = false;
    }
    // 设置透明度
    this.container.style.opacity = opacity.toString();
  }
  /**
   * 初始化透明度的递减效果
   * @Author   MJC
   * @DateTime 2019-01-29
   * @version  1.0.0
   * @return   {[type]}   [description]
   */
  initOpacityEffectEvent() {
    // 通过TICK来进行透明度的递减
    let opacityEffectEvent = this.viewer.clock.onTick.addEventListener(this.opacityHandle.bind(this), this.viewer);
    return opacityEffectEvent;
  }
}
export default MouseAnimation;
