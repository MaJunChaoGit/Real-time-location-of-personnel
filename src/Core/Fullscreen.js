import Fullscreen from 'cesium/Core/Fullscreen.js';
import defined from 'cesium/Core/defined';

/**
 * [fullScreen description]
 * 全屏功能方法
 * @Author   Mjc
 * @DateTime 2018-04-19T15:22:05+0800
 * @exports
 * @param    {String}  container 容器的id
 */
function fullScreen(container) {

  if (!defined(container)) {
    throw new Error('必须传入一个容器');
  }

  Fullscreen.fullscreen ? Fullscreen.exitFullscreen() : Fullscreen.requestFullscreen(container);
}

export default fullScreen;
