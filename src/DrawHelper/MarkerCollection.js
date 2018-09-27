import BillboardCollection from 'cesium/Scene/BillboardCollection';

export default class MarkerCollection extends BillboardCollection {
  destroy() {
    this.removeAll();
    this._primitives.remove(this);
  }
  set show(flag) {
    this._billboards[0].show = flag;
  }
  getType() {
    return 'marker';
  }
}
