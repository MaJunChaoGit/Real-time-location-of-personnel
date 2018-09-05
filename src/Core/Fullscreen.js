import Fullscreen from 'cesium/Core/Fullscreen.js';
import defined from 'cesium/Core/defined';

function fullScreen(container) {

  if (!defined(container)) {
    throw new Error('必须传入一个容器');
  }

  Fullscreen.fullscreen ? Fullscreen.exitFullscreen() : Fullscreen.requestFullscreen(container);
}

export default fullScreen;
