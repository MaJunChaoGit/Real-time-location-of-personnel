class PickedFeature {
  constructor() {
    
  }
}
export default PickedFeature;
// HTML overlay for showing feature name on mouseover
var nameOverlay = document.createElement('div');
viewer.container.appendChild(nameOverlay);
nameOverlay.className = 'backdrop';
nameOverlay.style.display = 'none';
nameOverlay.style.position = 'absolute';
nameOverlay.style.bottom = '0';
nameOverlay.style.left = '0';
nameOverlay.style['pointer-events'] = 'none';
nameOverlay.style.padding = '4px';
nameOverlay.style.backgroundColor = 'black';

// Information about the currently selected feature
var selected = {
  feature: undefined,
  originalColor: new Cesium.Color()
};

// An entity object which will hold info about the currently selected feature for infobox display
var selectedEntity = new Cesium.Entity();

// Get default left click handler for when a feature is not picked on left click
var clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

// Information about the currently highlighted feature
var highlighted = {
  feature: undefined,
  originalColor: new Cesium.Color()
};

// Color a feature yellow on hover.
viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
  // If a feature was previously highlighted, undo the highlight
  if (Cesium.defined(highlighted.feature)) {
    highlighted.feature.color = highlighted.originalColor;
    highlighted.feature = undefined;
  }
  // Pick a new feature
  var pickedFeature = viewer.scene.pick(movement.endPosition);
  if (!Cesium.defined(pickedFeature)) {
    nameOverlay.style.display = 'none';
    return;
  }
  // A feature was picked, so show it's overlay content
  nameOverlay.style.display = 'block';
  nameOverlay.style.bottom = viewer.canvas.clientHeight - movement.endPosition.y + 'px';
  nameOverlay.style.left = movement.endPosition.x + 'px';
  var name = pickedFeature.getProperty('name');
  if (!Cesium.defined(name)) {
    name = pickedFeature.getProperty('id');
  }
  nameOverlay.textContent = name;
  // Highlight the feature if it's not already selected.
  if (pickedFeature !== selected.feature) {
    highlighted.feature = pickedFeature;
    Cesium.Color.clone(pickedFeature.color, highlighted.originalColor);
    pickedFeature.color = Cesium.Color.RED.withAlpha(1.0);
    // pickedFeature._content._model.silhouetteColor = Cesium.Color.WHITE.withAlpha(1);
    // pickedFeature._content._model.silhouetteSize = 5;

  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// Color a feature on selection and show metadata in the InfoBox.
viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
  // If a feature was previously selected, undo the highlight
  if (Cesium.defined(selected.feature)) {
    selected.feature.color = selected.originalColor;
    selected.feature = undefined;
  }
  // Pick a new feature
  var pickedFeature = viewer.scene.pick(movement.position);
  if (!Cesium.defined(pickedFeature)) {
    clickHandler(movement);
    return;
  }
  // Select the feature if it's not already selected
  if (selected.feature === pickedFeature) {
    return;
  }
  selected.feature = pickedFeature;
  // Save the selected feature's original color
  if (pickedFeature === highlighted.feature) {
    Cesium.Color.clone(highlighted.originalColor, selected.originalColor);
    highlighted.feature = undefined;
  } else {
    Cesium.Color.clone(pickedFeature.color, selected.originalColor);
  }
  // Highlight newly selected feature
  pickedFeature.color = Cesium.Color.LIME;
  // Set feature infobox description
  var featureName = pickedFeature.getProperty('name');
  selectedEntity.name = featureName;
  selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
  viewer.selectedEntity = selectedEntity;
  selectedEntity.description = '<table class="cesium-infoBox-defaultTable"><tbody>' +
                                     '<tr><th>BIN</th><td>' + pickedFeature.getProperty('BIN') + '</td></tr>' +
                                     '<tr><th>DOITT ID</th><td>' + pickedFeature.getProperty('DOITT_ID') + '</td></tr>' +
                                     '<tr><th>SOURCE ID</th><td>' + pickedFeature.getProperty('SOURCE_ID') + '</td></tr>' +
                                     '<tr><th>Longitude</th><td>' + pickedFeature.getProperty('longitude') + '</td></tr>' +
                                     '<tr><th>Latitude</th><td>' + pickedFeature.getProperty('latitude') + '</td></tr>' +
                                     '<tr><th>Height</th><td>' + pickedFeature.getProperty('height') + '</td></tr>' +
                                     '<tr><th>Terrain Height (Ellipsoid)</th><td>' + pickedFeature.getProperty('TerrainHeight') + '</td></tr>' +
                                     '</tbody></table>';
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
