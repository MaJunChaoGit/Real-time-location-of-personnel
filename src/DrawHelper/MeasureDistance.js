import defined from 'cesium/Core/defined';
import Cartesian3 from 'cesium/Core/Cartesian3';
import Cartesian2 from 'cesium/Core/Cartesian2';
import Color from 'cesium/Core/Color';
import PolylineGeometry from 'cesium/Core/PolylineGeometry';
import LabelStyle from 'cesium/Scene/LabelStyle';
import ChangeablePrimitive from 'source/DrawHelper/ChangeablePrimitive';
import VertexFormat from 'cesium/Core/VertexFormat';
import ScreenSpaceEventHandler from 'cesium/Core/ScreenSpaceEventHandler';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import LabelCollection from 'cesium/Scene/LabelCollection';
import DrawHelper from 'source/DrawHelper/DrawHelper';
import BillboardGroup from 'source/DrawHelper/BillboardGroup';

/* eslint-disable */
class MeasureDistance extends ChangeablePrimitive {
  constructor(options) {
    super(options);
    this.isPolygon = false;
    this.labels = viewer.scene.primitives.add(new LabelCollection());
  }

  setPositions(positions) {
    this.setAttribute('positions', positions);
  }

  getPositions() {
    return this.getAttribute('positions');
  }

  // getType () {
  //     return "measure";
  // }

  getGeometryInstances() {
    if (!defined(this.positions) || this.positions.length < 2) {
      return;
    }
    this.labels.removeAll();
    addDistanceLanel(this.positions, this.labels);
    let geometry = new PolylineGeometry({
      positions: this.positions,
      height: this.height,
      width: 2,
      vertexFormat: VertexFormat.POSITION_AND_NORMAL,
      ellipsoid: this.ellipsoid
    });
    let geometryInstances = this.createGeometryInstance(geometry, this.color);
    return geometryInstances;
  }
  setEditMode(editMode) {
    if (this._editMode == editMode) {
      return;
    }
    if (editMode) {
      DrawHelper.setEdited(this);
      let scene = global.viewer.scene;
      let _self = this;
      if (this._markers == null) {
        let markers = new BillboardGroup(scene, undefined, this._primitives);
        function onEdited() {
          _self.executeListeners({name: 'onEdited', positions: _self.positions});
        }
        let handleMarkerChanges = {
          dragHandlers: {
            onDrag: function(index, position) {
              if (defined(_self.billboards) && index === (_self.positions.length - 1)) {
                _self.billboards._billboards[0].position = position;
              }
              _self.positions[index] = position;
              _self._createPrimitive = true;
            },
            onDragEnd: function(index, position) {
              debugger
              _self._createPrimitive = true;
              onEdited();
            }
          },
          onDoubleClick: function(index) {
            if (_self.positions.length < 3) {
              return;
            }
            _self.positions.splice(index, 1);
            _self._createPrimitive = true;
            markers.removeBillboard(index);
            onEdited();
          }
        };
        markers.addBillboards(_self.positions, handleMarkerChanges);
        this._markers = markers;
        this._globeClickhandler = new ScreenSpaceEventHandler(scene.canvas);
        this._globeClickhandler.setInputAction(
          function(movement) {
            let pickedObject = scene.pick(movement.position);
            if (!(pickedObject && pickedObject.primitive)) {
              _self.setEditMode(false);
            }
          }, ScreenSpaceEventType.LEFT_CLICK);
        markers.setOnTop();
      }
      this._editMode = true;
    } else {
      if (this._markers != null) {
        this._markers.remove();
        this._markers = null;
        this._globeClickhandler.destroy();
      }
      this._editMode = false;
    }
  }
}
function addDistanceLanel(positions, labels) {
  let distance = 0, text;
  for (let i = 1; i < positions.length; ++i) {
    distance += Cartesian3.distance(positions[i - 1], positions[i]);
    if (distance > 1000) {
      text = (distance / 1000).toFixed(2) + '千米 ';
    } else {
      text = distance.toFixed(2) + '米 ';
    }
    labels.add({
      position: positions[i],
      text: text,
      font: '15px 微软雅黑',
      horizontalOrigin: -1,
      verticalOrigin: 0,
      fillColor: Color.fromCssColorString('#c54204'),
      style: LabelStyle.FILL_AND_OUTLINE,
      outlineColor: Color.IVORY,
      outlineWidth: 2,
    });
  }
}
export default MeasureDistance;
