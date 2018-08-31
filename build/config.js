var path = require('path');

// 路径别名导出
exports.alias = {
  cesium: path.resolve(__dirname, '../node_modules/cesium/Source/'),
  source: path.resolve(__dirname, '../src'),
  ex: path.resolve(__dirname, '../examples/'),
  vue$: 'vue/dist/vue.common.js'
};
// 不进行测试的文件与路径
exports.jsexclude = /node_modules|utils\/popper\.js|utils\/date\.js/;
