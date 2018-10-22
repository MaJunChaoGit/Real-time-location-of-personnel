const isDev = process.env.NODE_ENV === 'development';

export default {
  newYork: isDev ? 'http://localhost:9999/NewYork/tileset.json' : 'http://mozhengying.com:32768/NewYork/tileset.json',
  saveMovingTarget: isDev ? 'http://localhost:8080/realtime/saveMovingTarget' : 'http://mozhengying.com:8080/realtime/saveMovingTarget',
  movingTargets: isDev ? 'http://localhost:8080/realtime/movingTargets' : 'http://mozhengying.com:8080/realtime/movingTargets'
};
