import defined from 'cesium/Core/defined';
import defaultValue from 'cesium/Core/defaultValue';
import destroyObject from 'cesium/Core/destroyObject';
import GeometryInstance from 'cesium/Core/GeometryInstance';
import Ellipsoid from 'cesium/Core/Ellipsoid';
import Primitive from 'cesium/Scene/Primitive';
import ColorGeometryInstanceAttribute from 'cesium/Core/ColorGeometryInstanceAttribute';
import PerInstanceColorAppearance from 'cesium/Scene/PerInstanceColorAppearance';
import optionsFunction from './optionsFunction';
import Color from 'cesium/Core/Color';
import localStorage from 'ex/assets/utils/LocalStorage';

class ChangeablePrimitive {
  constructor(options) {
    options = options || {};
    this.ellipsoid = defaultValue(options.ellipsoid, Ellipsoid.WGS84);
    this.textureRotationAngle = defaultValue(options.textureRotationAngle, 0.0);
    this.asynchronous = defaultValue(options.asynchronous, false);
    this.show = defaultValue(options.show, true);
    this.debugShowBoundingVolume = defaultValue(options.debugShowBoundingVolume, false);
    this.color = defaultValue(options.color, 'rgba(124, 252, 0, 0.6)');
    this.appearance = defaultValue(options.appearance, new PerInstanceColorAppearance());
    this.rotation = defaultValue(options.rotation, 0);
    optionsFunction.fillOptions(this, options);

    this._ellipsoid = undefined;
    this._granularity = undefined;
    this._textureRotationAngle = undefined;
    this._id = undefined;
    this._createPrimitive = true;
    this._primitive = undefined;
    this._outlinePolygon = undefined;
    this._appendPrimitive = undefined;
  }

  setAttribute(name, value) {
    this[name] = value;
    if (name === 'inText') {
      let url;
      if (value === '') {
        url = localStorage.get('apiUrl').renderDataUrl + this.code;
      } else {
        url = localStorage.get('apiUrl').textRenderDataUrl + this.code + '/' + value;
      }
      let _self = this;
      let ajax = new XMLHttpRequest();
      ajax.open('get', url);
      ajax.send();
      ajax.onreadystatechange = function() {
        if (ajax.readyState === 4 && ajax.status === 200) {
          let msg = JSON.parse(ajax.responseText);
          if (msg.success) {
            _self.attri = msg.data.Symbol;
            _self._createPrimitive = true;
          }
        }
      };
    } else {
      this._createPrimitive = true;
    }
  }

  getAttribute(name) {
    return this[name];
  }

  update(context, frameState, commandList) {
    if (!this.show) {
      return;
    }
    if (!this._createPrimitive && (!defined(this._primitive))) {
      return;
    }
    if (this._createPrimitive ||
            (this._ellipsoid !== this.ellipsoid) ||
            (this._granularity !== this.granularity) ||
            (this._textureRotationAngle !== this.textureRotationAngle) ||
            (this._id !== this.id)) {

      let geometryInstances = this.getGeometryInstances();
      if (!geometryInstances) {
        return;
      }

      this._createPrimitive = false;
      this._ellipsoid = this.ellipsoid;
      this._granularity = this.granularity;
      this._textureRotationAngle = this.textureRotationAngle;
      this._id = this.id;

      this._primitive = this._primitive && this._primitive.destroy();
      this._primitive = new Primitive({
        geometryInstances: geometryInstances,
        appearance: this.appearance,
        asynchronous: this.asynchronous
      });

      this._framePrimitive = this._framePrimitive && this._framePrimitive.destroy();
      if (this.getFramePrimitive) {
        this._framePrimitive = new Primitive({
          geometryInstances: this.getFramePrimitive(),
          appearance: this.appearance,
          asynchronous: this.asynchronous
        });
      }
    }
    this._primitive.update(context, frameState, commandList);
    this._framePrimitive && this._framePrimitive.update(context, frameState, commandList);
  }

  isDestroyed() {
    return false;
  }

  destroy() {
    if (this.setEditMode) {
      this.setEditMode(false);
    }
    this.labels = this.labels && this._primitives.remove(this.labels);
    this.billboards = this.billboards && this._primitives.remove(this.billboards);
    this._primitive = this._primitive && this._primitive.destroy();
    this._framePrimitive = this._framePrimitive && this._framePrimitive.destroy();
    this._primitives = this._primitives && this._primitives.remove(this);
    return destroyObject(this);
  }
  createGeometryInstance(geometry, color, id) {
    return new GeometryInstance({
      geometry: geometry,
      id: id,
      pickPrimitive: this,
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(Color.fromCssColorString(color))
      }
    });
  }
}

export default ChangeablePrimitive;
