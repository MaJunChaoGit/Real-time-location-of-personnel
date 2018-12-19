/**
 * [NameOverlay description]
 * 标牌控制类
 * @Author   Mjc
 * @DateTime 2018-10-08
 * @exports
 * @param    {Object}  viewer 场景对象
 * @return
 */
class NameOverlay {
  /**
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {String}   className 标牌的class名字
   * @param    {Object}  viewer 场景对象
   */
  constructor(className, viewer) {
    this.viewer = viewer;

    this.className = className;

    this.nameOverlay = this._createElement();

    this.viewer.container.appendChild(this.nameOverlay);

    this.nameOverlay.className = this.className;

  }
  _createElement() {
    let nameOverlay = document.createElement('div');
    return nameOverlay;
  }
  /**
   * 控制标牌的显示隐藏
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {Boolean}  isShow 控制Div标牌的显示隐藏
   */
  show(isShow) {
    isShow ? this.nameOverlay.style.display = 'block' : this.nameOverlay.style.display = 'none';
  }
  /**
   * 控制标牌的位置
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {Object}   movement 事件中的movement对象
   */
  setPostion(movement) {
    this.nameOverlay.style.bottom = this.viewer.canvas.clientHeight - movement.endPosition.y + 'px';
    this.nameOverlay.style.left = movement.endPosition.x + 'px';
  }
  /**
   * 控制标牌中的文字内容
   * @Author   MJC
   * @DateTime 2018-10-08
   * @version  1.0.0
   * @param    {String}   text 标牌中的文字内容
   */
  text(text) {
    this.nameOverlay.textContent = text;
  }
}

export default NameOverlay;
