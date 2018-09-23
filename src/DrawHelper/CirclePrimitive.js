import defined from 'cesium/Core/defined';
import DeveloperError from 'cesium/Core/DeveloperError';
import Cartesian3 from 'cesium/Core/Cartesian3';
import CircleGeometry from 'cesium/Core/CircleGeometry';
import CircleOutlineGeometry from 'cesium/Core/CircleOutlineGeometry';
import EllipsoidSurfaceAppearance from 'cesium/Scene/EllipsoidSurfaceAppearance';
import ChangeablePrimitive from './ChangeablePrimitive';

/* eslint-disable */
class CirclePrimitive {
  constructor(options) {
    if (!(defined(options.center) && defined(options.radius))) {
      throw new DeveloperError('Center and radius are required');
    }
    Object.setPrototypeOf(Object.getPrototypeOf(this), new ChangeablePrimitive(options));
  }

  setCenter(center) {
    this.setAttribute('center', center);
  }

  setRadius(radius) {
    this.setAttribute('radius', Math.max(0.1, radius));
  }

  getCenter() {
    return this.getAttribute('center');
  }

  getRadius() {
    return this.getAttribute('radius');
  }

  getType(geodesic) {
    return 'circle';
  }

  getGeometry() {
    if (!(defined(this.center) && defined(this.radius))) {
      return;
    }

    return new CircleGeometry({
      center: this.center,
      radius: this.radius,
      height: this.height,
      vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      stRotation: this.textureRotationAngle,
      ellipsoid: this.ellipsoid,
      granularity: this.granularity
    });
  }

  getOutlineGeometry() {
    return new CircleOutlineGeometry({
      center: this.getCenter(),
      radius: this.getRadius()
    });
  }

  getCircleCartesianCoordinates(granularity) {
    var geometry = CircleOutlineGeometry.createGeometry(
      new CircleOutlineGeometry({
        ellipsoid: this.ellipsoid,
        center: this.getCenter(),
        radius: this.getRadius(),
        granularity: granularity
      })
    );
    var count = 0, value, values = [];
    for (; count < geometry.attributes.position.values.length; count += 3) {
      value = geometry.attributes.position.values;
      values[values.length] = new Cartesian3(value[count], value[count + 1], value[count + 2]);
    }
    return values;
  }
}
export default CirclePrimitive;
