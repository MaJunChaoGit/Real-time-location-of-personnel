class NameOverlay {
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
  show(isShow) {
    isShow ? this.nameOverlay.style.display = 'block' : this.nameOverlay.style.display = 'none';
  }
  setPostion(movement) {
    this.nameOverlay.style.bottom = this.viewer.canvas.clientHeight - movement.endPosition.y + 'px';
    this.nameOverlay.style.left = movement.endPosition.x + 'px';
  }
  text(text) {
    this.nameOverlay.textContent = text;
  }
}

export default NameOverlay;
