class NameOverlay {
  constuctor(className, style, viewer) {
    this.viewer = viewer;
    this.className = className;
    this.style = style;

    this.nameOverlay = this._createElement();

    this.viewer.container.appendChild(this.nameOverlay);
  }
  _createElement() {
    let nameOverlay = document.createElement('div');

    nameOverlay.className = this.className;

    nameOverlay.style = this.style;

    return nameOverlay;
  }
  show(isShow) {
    isShow ? this.nameOverlay.style.display = 'block' : this.nameOverlay.style.display = 'none';
  }
  setPostion(movement) {
    this.nameOverlay.style.bottom = this.viewer.canvas.clientHeight - movement.endPosition.y + 'px';
    this.nameOverlay.style.left = movement.endPosition.x + 'px';
  }
}

export default NameOverlay;
