import defined from 'cesium/Core/defined';
import DeveloperError from 'cesium/Core/DeveloperError';
import Cartesian3 from 'cesium/Core/Cartesian3';
import EllipseGeometry from 'cesium/Core/EllipseGeometry';
import EllipseOutlineGeometry from 'cesium/Core/EllipseOutlineGeometry';
import EllipsoidSurfaceAppearance from 'cesium/Scene/EllipsoidSurfaceAppearance';
import ChangeablePrimitive from './ChangeablePrimitive';

/* eslint-disable */
class EllipsePrimitive {
  constructor(options) {
    if (!(defined(options.center) && defined(options.semiMajorAxis) && defined(options.semiMinorAxis))) {
      throw new DeveloperError('Center and semi major and semi minor axis are required');
    }

    Object.setPrototypeOf(Object.getPrototypeOf(this), new ChangeablePrimitive(options));
  }

  setCenter(center) {
    this.setAttribute('center', center);
  }

  setSemiMajorAxis(semiMajorAxis) {
    if (semiMajorAxis < this.getSemiMinorAxis()) return;
    this.setAttribute('semiMajorAxis', semiMajorAxis);
  }

  setSemiMinorAxis(semiMinorAxis) {
    if (semiMinorAxis > this.getSemiMajorAxis()) return;
    this.setAttribute('semiMinorAxis', semiMinorAxis);
  }

  setRotation(rotation) {
    return this.setAttribute('rotation', rotation);
  }

  getCenter() {
    return this.getAttribute('center');
  }

  getSemiMajorAxis() {
    return this.getAttribute('semiMajorAxis');
  }

  getSemiMinorAxis() {
    return this.getAttribute('semiMinorAxis');
  }

  getRotation() {
    return this.getAttribute('rotation');
  }

  getType(geodesic) {
    return 'ellipse';
  }

  getGeometry() {
    if (!(defined(this.center) && defined(this.semiMajorAxis) && defined(this.semiMinorAxis))) {
      return;
    }

    return new EllipseGeometry({
      ellipsoid: this.ellipsoid,
      center: this.center,
      semiMajorAxis: this.semiMajorAxis,
      semiMinorAxis: this.semiMinorAxis,
      rotation: this.rotation,
      height: this.height,
      vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      stRotation: this.textureRotationAngle,
      ellipsoid: this.ellipsoid,
      granularity: this.granularity
    });
  }

  getOutlineGeometry() {
    return new EllipseOutlineGeometry({
      center: this.getCenter(),
      semiMajorAxis: this.getSemiMajorAxis(),
      semiMinorAxis: this.getSemiMinorAxis(),
      rotation: this.getRotation()
    });
  }

  getEllipseBoundary() {
    var geometry = EllipseOutlineGeometry.createGeometry(
      new EllipseOutlineGeometry({
        ellipsoid: this.ellipsoid,
        center: this.getCenter(),
        semiMajorAxis: this.getSemiMajorAxis(),
        semiMinorAxis: this.getSemiMinorAxis(),
        rotation: this.getRotation()
      })
    );
    var count = 33, values = [];
    var value = geometry.attributes.position.values;
    for (; count < geometry.attributes.position.values.length; count += 36) {
      values.push(new Cartesian3(value[count], value[count + 1], value[count + 2]));
    }
    return values;
  }
}
export default EllipsePrimitive;
