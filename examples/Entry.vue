<template>
  <div id="cesiumContainer"></div>
</template>

<script>
import { 
  Viewer, 
  createWorldTerrain, 
  PrimitiveCollection, 
  Cesium3DTileset, 
  Cartesian3, 
  HeadingPitchRoll, 
  Matrix4 
} from '../src/index';

export default {
  name: 'Entry',
  mounted() {
    let viewer = new Viewer('cesiumContainer');

    let primitiveCollection = new PrimitiveCollection();


    primitiveCollection.add(new Cesium3DTileset({
      url: this.$api.newYork
    }));

    viewer.scene.primitives.add(primitiveCollection);

    let initialPosition = Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821, 753);
    let initialOrientation = new HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
    viewer.scene.camera.setView({
        destination: initialPosition,
        orientation: initialOrientation,
        endTransform: Matrix4.IDENTITY
    });
  }
};
</script>
