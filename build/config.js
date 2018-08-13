var path = require('path');

// 路径别名导出
exports.alias = {
  src: path.resolve(__dirname, '../src')
};
// 不进行测试的文件与路径
exports.jsexclude = /node_modules|utils\/popper\.js|utils\/date\.js/;
