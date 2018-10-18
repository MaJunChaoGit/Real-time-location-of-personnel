import Color from 'cesium/Core/Color';

const TypeEnum = {
  '1': {
    color: Color.SKYBLUE,
    scale: 10,
    uri: '../Assets/liangxiangche/liangxiangche.gltf',
    minimumPixelSize: 10,
    maximumScale: 20,
    name: '家用车'
  },
  '2': {
    color: Color.CORAL,
    scale: 100,
    uri: '../Assets/xiaofangche/xiaofangche.gltf',
    minimumPixelSize: 30,
    maximumScale: 55,
    name: '消防车'
  },
  '3': {
    color: Color.DEEPPINK,
    scale: 1,
    uri: '../Assets/jiuhuche/jiuhuche.gltf',
    minimumPixelSize: 2,
    maximumScale: 4,
    name: '救护车'
  },
  '4': {
    color: Color.GREENYELLOW,
    scale: 20,
    uri: '../Assets/a4/a4.gltf',
    minimumPixelSize: 30,
    maximumScale: 40,
    name: '政府车辆'
  },
  '5': {
    color: Color.MAGENTA,
    scale: 20,
    uri: '../Assets/junyongkache/junyongkache.gltf',
    minimumPixelSize: 30,
    maximumScale: 40,
    name: '军用车辆'
  },
  '6': {
    color: Color.GOLD,
    scale: 1,
    uri: '../Assets/youguanche/youguanche.gltf',
    minimumPixelSize: 3,
    maximumScale: 5,
    name: '危险车辆'
  }
};

export default TypeEnum;
