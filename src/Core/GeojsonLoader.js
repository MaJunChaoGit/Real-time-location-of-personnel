import GeoJsonDataSource from 'cesium/DataSources/GeoJsonDataSource';
import defined from 'cesium/Core/defined';
import Color from 'cesium/Core/Color';
import ClassificationType from 'cesium/Scene/ClassificationType';
import JulianDate from 'cesium/Core/JulianDate';
import BoundingSphere from 'cesium/Core/BoundingSphere';
import Ellipsoid from 'cesium/Core/Ellipsoid';
import HorizontalOrigin from 'cesium/Scene/HorizontalOrigin';
import VerticalOrigin from 'cesium/Scene/VerticalOrigin';
import DistanceDisplayCondition from 'cesium/Core/DistanceDisplayCondition';

class GeojsonLoader {
  constructor(viewer, url, isClampGroud = false) {
    let neighborhoodsPromise = GeoJsonDataSource.load(url, {
      isClampGroud: isClampGroud
    });

    return new Promise(resolve => {
      neighborhoodsPromise.then(dataSource => {
        viewer.dataSources.add(dataSource);
        let neighborhoodEntities = dataSource.entities.values;
        this.changeStyle(neighborhoodEntities);
        resolve(dataSource);
      });
    });
  }

  changeStyle(entities) {
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      if (defined(entity.polygon)) {
        entity.name = entity.properties.neighborhood;
        entity.polygon.material = Color.fromRandom({
          minimumRed: 0.129,
          maximumRed: 0.278,
          minimumGreen: 0.364,
          maximumGreen: 0.611,
          minimumBlue: 0.58,
          alpha: 0.1
        });
        // entity.polygon.material = Color.fromCssColorString('rgba(27, 68, 10, 0.4)');
        // entity.polygon.fill = false;
        // entity.polygon.outlineColor = Color.fromCssColorString('rgba(152, 242, 255, 0.43)');
        entity.polygon.classificationType = ClassificationType.BOTH;
        let polyPositions = entity.polygon.hierarchy.getValue(JulianDate.now()).positions;
        let polyCenter = BoundingSphere.fromPoints(polyPositions).center;
        polyCenter = Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
        entity.position = polyCenter;
        // Generate labels
        entity.label = {
          text: entity.name,
          showBackground: false,
          scale: 0.6,
          horizontalOrigin: HorizontalOrigin.CENTER,
          verticalOrigin: VerticalOrigin.BOTTOM,
          distanceDisplayCondition: new DistanceDisplayCondition(10.0, 8000.0),
          disableDepthTestDistance: 100.0
        };
      }
    }
  }
}
export default GeojsonLoader;
