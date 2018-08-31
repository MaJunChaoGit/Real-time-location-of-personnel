import getElement from 'cesium/Widgets/getElement';
import * as Knockout from 'knockout-es5/dist/knockout-es5.min';
import createFragmentFromTemplate from './createFragmentFromTemplate';

var loadView = function(htmlString, container, viewModel) {
  // 获取div对象
  container = getElement(container);
  // 获取fragmen对象
  var fragment = createFragmentFromTemplate(htmlString);

  // 可惜的是,fragment.childnodes没有办法使用slice方法
  // 要不然,这些代码可以被替换成Array.prototype.slice.call(fragment.childNodes)
  // 不过这样可能更容易出错
  var nodes = [];

  // 遍历fragment.childNodes并将他放入nodes数组变量中
  var i;
  for (i = 0; i < fragment.childNodes.length; ++i) {
    nodes.push(fragment.childNodes[i]);
  }

  // 将fragment添加到dom文档中
  container.appendChild(fragment);

  // 遍历节点,如果是元素或者是注释类型的话,将视图对象和该dom对象绑定
  for (i = 0; i < nodes.length; ++i) {
    var node = nodes[i];
    if (node.nodeType === 1 || node.nodeType === 8) {
      Knockout.applyBindings(viewModel, node);
    }
  }

  return nodes;
};

export default loadView;
