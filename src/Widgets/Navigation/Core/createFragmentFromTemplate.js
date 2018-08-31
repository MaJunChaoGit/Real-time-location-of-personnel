/**
     * 循环使用createDocumentFragment添加HTML模板字符串,而不破坏文档结构
     * @Author   Mjc
     * @DateTime 2018-04-23T17:10:20+0800
     * @exports
     * @param    {String}                 htmlString HTML的模板字符串
     * @return   {fragment}                          返回fragment
     */
var createFragmentFromTemplate = function(htmlString) {
  var holder = document.createElement('div');
  holder.innerHTML = htmlString;

  var fragment = document.createDocumentFragment();

  while (holder.firstChild) {
    fragment.appendChild(holder.firstChild);
  }

  return fragment;
};

export default createFragmentFromTemplate;
