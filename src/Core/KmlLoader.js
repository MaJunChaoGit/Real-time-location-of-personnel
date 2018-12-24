//   defined,
//   VerticalOrigin,
//   DistanceDisplayCondition,
//   Cartographic,
//   JulianDate,
//   Math
import KmlDataSource from 'cesium/DataSources/KmlDataSource';
// import Clustering from '../../src/Core/Clustering';
class KmlLoader {
  constructor(viewer, url, isClampGroud = false) {
    this.options = {
      camera: viewer.scene.camera,
      canvas: viewer.scene.canvas,
      clampToGround: isClampGroud
    };
    this._url = url;
    this.promise = KmlDataSource.load(this._url, this.options);

    return new Promise(resolve => {
      this.promise.then((dataSource) => {
        viewer.dataSources.add(dataSource);
        resolve(dataSource);
      });
    });
  }

};
// geocachePromise.then(function(dataSource) {
//   // Add the new data as entities to the viewer
//   viewer.dataSources.add(dataSource);
//   let clustering = new Clustering({
//     dataSource: dataSource
//   });
//   clustering.setStyle();
//   // Get the array of entities

//   for (var i = 0; i < geocacheEntities.length; i++) {
//     var entity = geocacheEntities[i];
//     if (defined(entity.billboard)) {
//       // Entity styling code here
//       // Adjust the vertical origin so pins sit on terrain
//       entity.billboard.verticalOrigin = VerticalOrigin.BOTTOM;
//       // Disable the labels to reduce clutter
//       entity.label = undefined;
//       // Add distance display condition
//       entity.billboard.distanceDisplayCondition = new DistanceDisplayCondition(10.0, 20000.0);
//       // Compute longitude and latitude in degrees
//       var cartographicPosition = Cartographic.fromCartesian(entity.position.getValue(JulianDate.now()));
//       var longitude = Math.toDegrees(cartographicPosition.longitude);
//       var latitude = Math.toDegrees(cartographicPosition.latitude);
//       // Modify description
//       // Modify description
//       var description = '<table class="cesium-infoBox-defaultTable cesium-infoBox-defaultTable-lighter"><tbody>' +
//           '<tr><th>' + 'Longitude' + '</th><td>' + longitude.toFixed(5) + '</td></tr>' +
//           '<tr><th>' + 'Latitude' + '</th><td>' + latitude.toFixed(5) + '</td></tr>' +
//           '</tbody></table>';
//       entity.description = description;
//     }
//   }

// });
export default KmlLoader;
