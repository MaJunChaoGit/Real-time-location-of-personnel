// // import GeoJsonDataSource from 'cesium/DataSources/GeoJsonDataSource';
// // import defined from 'cesium/Core/defined';
// //   Color,
// //   JulianDate,
// //   BoundingSphere,
// //   Ellipsoid,
// //   HorizontalOrigin,
// //   VerticalOrigin,
// //   DistanceDisplayCondition,
// //   ClassificationType
// var geojsonOptions = {
//               clampToGround: true
//             };
//             // Load neighborhood boundaries from KML file
//             var neighborhoodsPromise = GeoJsonDataSource.load('../../src/Assets/newYorkData/sampleNeighborhoods.geojson', geojsonOptions);

//             let neighborhoods;
//             neighborhoodsPromise.then(function(dataSource) {
//               // Add the new data as entities to the viewer
//               viewer.dataSources.add(dataSource);
//               neighborhoods = dataSource.entities;

//               // Get the array of entities
//               var neighborhoodEntities = dataSource.entities.values;
//               for (var i = 0; i < neighborhoodEntities.length; i++) {
//                 var entity = neighborhoodEntities[i];

//                 if (defined(entity.polygon)) {
//                   debugger
//                   entity.name = entity.properties.neighborhood;
//                   // entity styling code here
//                   entity.polygon.material = Color.fromRandom({
//                     red: 0.1,
//                     maximumGreen: 0.5,
//                     minimumBlue: 0.5,
//                     alpha: 0.3
//                   });
//                   entity.polygon.classificationType = ClassificationType.BOTH;
//                   // Generate Polygon position
//                   var polyPositions = entity.polygon.hierarchy.getValue(JulianDate.now()).positions;
//                   var polyCenter = BoundingSphere.fromPoints(polyPositions).center;
//                   polyCenter = Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
//                   entity.position = polyCenter;
//                   // Generate labels
//                   entity.label = {
//                     text: entity.name,
//                     showBackground: false,
//                     scale: 0.6,
//                     horizontalOrigin: HorizontalOrigin.CENTER,
//                     verticalOrigin: VerticalOrigin.BOTTOM,
//                     distanceDisplayCondition: new DistanceDisplayCondition(10.0, 8000.0),
//                     disableDepthTestDistance: 100.0
//                   };
//                 }
//               }
//             });
