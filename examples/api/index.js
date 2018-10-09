const isDev = process.env.NODE_ENV === 'development';

export default {
  newYork: isDev ? 'http://172.20.10.2:9999/NewYork/tileset.json' : 'http://mozhengying.com:32768/NewYork/tileset.json'
};
