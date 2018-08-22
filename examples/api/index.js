const isDev = process.env.NODE_ENV === 'development';

export default {
  newYork: isDev ? 'http://192.168.1.21:8888/NewYork/tileset.json' : 'http://static.mozhengying.net/NewYork/tileset.json'
};
