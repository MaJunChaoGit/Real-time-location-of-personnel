var fs = require('fs');
var path = require('path');
var Components = require('../../components.json');
var render = require('json-templater/string');
var endOfLine = require('os').EOL;

function mergeTemplate(importName, path, exportName) {
  includeComponentTemplate.push(render(IMPORT_TEMPLATE, {
    name: importName,
    path: path
  }));

  // 如果是自定Shaders或者是源码中的Shaders, 装入Shaders数组, 负责正常装入导出模块
  if (/^\'(cesium|source){1}\/Shaders\/.*/.test(path)) {
    var index = shadersListTemplate.indexOf(importName);
    if (index > -1) {
      shadersListTemplate.splice(index, 1, importName);
    } else {
      shadersListTemplate.push(render(SHADERS_TEMPLATE, {
        name: importName
      }));
    }
  } else {
    listTemplate.push(render(EXPORT_TEMPLATE, {
      importName: importName,
      exportName: exportName
    }));
  }
}

var IMPORT_TEMPLATE = 'import {{name}} from {{path}};';
var EXPORT_TEMPLATE = '{{exportName}}: {{importName}}';
var OUTPUT_PATH = path.join(__dirname, '../../src/index.js');
var SHADERS_TEMPLATE = '{{name}}';
var MAIN_TEMPLATE = `/* Automatically generated by './build/bin/build-entry.js' */
{{include}}

const _shaders = {
  {{_shaders}}
};

module.exports = {
  version: '{{version}}',
  _shaders: _shaders,
  {{list}}
};

module.exports.default = module.exports;
`;

var source = fs.readFileSync(path.join(__dirname, '../../node_modules/cesium/Source/Cesium.js'));
// 将 define(['./Core/appendForwardSlash', './Core/ApproximateTerrainHeights'])
// 转化为 ['cesium/Core/appendForwardSlash', '/Core/ApproximateTerrainHeights'] 的数组
var sourcePathList = /define\(\[(.+)\]/g.exec(source.toString())[1].replace(/\'\./g, '\'cesium').split(', ');

var ComponentNames = Object.keys(Components);

var includeComponentTemplate = [];
var shadersListTemplate = [];
var listTemplate = [];

sourcePathList.forEach(path => {
  // 将数组中每一项 如: 'cesium/Core/appendForwardSlash'通过正则解析
  // 转化为 路径文件夹名_模块名 如: Core_appendForwardSlash
  var importName = path.replace(/\'/g, '').replace(/^cesium\//, '').replace(/[\.\-]/g, '_').split('\/').join('_');
  // 获取导出的模块名 appendForwardSlash
  var exportName = /.*\/(.+)\'$/.exec(path)[1].replace(/[\.\-]/g, '_');
  // 如果该模块已被继承, 那么直接覆盖其导入的路径, 并删除Components中的对象
  if (ComponentNames.indexOf(exportName) > -1) {
    path = Components[exportName];
    ComponentNames.splice(ComponentNames.indexOf(exportName), 1);
    delete Components[exportName];
  }

  mergeTemplate(importName, path, exportName);
});

ComponentNames.forEach(com => {
  var path = Components[com];

  var importName = path.replace(/\'/g, '').replace(/^source\//, '').replace(/[\.\-]/g, '_').split('\/').join('_');
  var exportName = com;

  mergeTemplate(importName, path, exportName);
});

var template = render(MAIN_TEMPLATE, {
  include: includeComponentTemplate.join(endOfLine),
  version: process.env.VERSION || require('../../package.json').version,
  _shaders: shadersListTemplate.join(',' + endOfLine + '  '),
  list: listTemplate.join(',' + endOfLine + '  ')
});

fs.writeFileSync(OUTPUT_PATH, template);

console.log('[build entry] DONE:', OUTPUT_PATH);
