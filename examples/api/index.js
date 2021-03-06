const isDev = process.env.NODE_ENV === 'development';

export default {
  IonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNTNlZjE1ZC1kMDZjLTQyNzQtYWJlMC04NzY4ODU0NjQzNmYiLCJpZCI6MjY2NywiaWF0IjoxNTM1MDgwNzU3fQ.t6hJUdDhs005ZfaF5O8PaxoBZ3g37Et7QG-ub852UXk',
  newYork: isDev ? 'http://localhost:9999/NewYork/tileset.json' : 'http://mozhengying.com:32768/NewYork/tileset.json',
  saveMovingTarget: isDev ? 'http://localhost:8080/realtime/saveMovingTarget' : 'http://mozhengying.com:8080/realtime/saveMovingTarget',
  lifeCircle: isDev ? 'http://localhost:8080/realtime/lifeCircle' : 'http://mozhengying.com:8080/realtime/lifeCircle',
  heatmap: isDev ? 'http://localhost:8080/realtime/heatmap' : 'http://mozhengying.com:8080/realtime/heatmap',
  movingTargets: isDev ? 'ws://localhost:8080/realtime/movingTargets' : 'ws://mozhengying.com:8080/realtime/movingTargets'
};
