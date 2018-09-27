import Color from 'cesium/Core/Color';
import Cartesian3 from 'cesium/Core/Cartesian3';
import BillboardCollection from 'cesium/Scene/BillboardCollection';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import ScreenSpaceEventHandler from 'cesium/Core/ScreenSpaceEventHandler';

const iconUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAALCAYAAACprHcmAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sKHAksBNXfIvIAAADGSURBVBjTlZC9DsFgFIafWsQgDE0vwGBjNVjNdYl1BYYmbkDim0yMEotFooNEW+Wjr6GfpCQG73J+nmc5B/6I924kNYEh0APawAXYAxvP827URUlTSZGkg6S7q5HbN+vySNJM0lOfebr9CKABUBRFH5i851oawMTxCuZ53gGCH3cFjldymqYZcPohnxyv5CzLdsASKL/EElg6XsnW2rUxZgHMgSPwcHVujFlYa9cff47juJUkyRgYAF3gDGx931+FYXjl37wANeOE+Ghv1/sAAAAASUVORK5CYII=';
class BillboardGroup {
  constructor(scene, options, primitives) {
    let option = options || {};
    this._scene = scene;
    this._billboards = new BillboardCollection();
    this._primitives = primitives || this._scene.primitives;
    this._primitives.add(this._billboards);
    this._orderedBillboards = [];
    this.ellipsoid = scene.globe.ellipsoid;
    this.scale = option.scale || 1.0;
  }

  createBillboard(position, callbacks) {
    var billboard = this._billboards.add({
      show: true,
      position: position,
      eyeOffset: new Cartesian3(0.0, 0.0, 0.0),
      horizontalOrigin: 0,
      verticalOrigin: 0,
      scale: this.scale,
      image: iconUrl,
      color: new Color(1.0, 1.0, 1.0, 1.0)
    });

    if (callbacks) {
      var _self = this;
      var screenSpaceCameraController = this._scene.screenSpaceCameraController;
      /* eslint-disable */
      function enableRotation(enable) {
        screenSpaceCameraController.enableRotate = enable;
      }
      function getIndex() {
        for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
        return i;
      }
      if (callbacks.dragHandlers) {
        var _self = this;
        setListener(billboard, 'leftDown', function(position) {
          function onDrag(position) {
            billboard.position = position;
            for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
            callbacks.dragHandlers.onDrag && callbacks.dragHandlers.onDrag(getIndex(), position);
          }
          function onDragEnd(position) {
            handler.destroy();
            enableRotation(true);
            callbacks.dragHandlers.onDragEnd && callbacks.dragHandlers.onDragEnd(getIndex(), position);
          }
          var handler = new ScreenSpaceEventHandler(_self._scene.canvas);
          handler.setInputAction(function(movement) {
            var cartesian = _self._scene.camera.pickEllipsoid(movement.endPosition, _self.ellipsoid);
            if (cartesian) {
              onDrag(cartesian);
            } else {
              onDragEnd(cartesian);
            }
          }, ScreenSpaceEventType.MOUSE_MOVE);

          handler.setInputAction(function(movement) {
            onDragEnd(_self._scene.camera.pickEllipsoid(position, _self.ellipsoid));
          }, ScreenSpaceEventType.LEFT_UP);

          enableRotation(false);
          callbacks.dragHandlers.onDragStart && callbacks.dragHandlers.onDragStart(getIndex(), _self._scene.camera.pickEllipsoid(position, _self.ellipsoid));
        });
      }
      if (callbacks.onDoubleClick) {
        setListener(billboard, 'leftDoubleClick', function(position) {
          callbacks.onDoubleClick(getIndex());
        });
      }
      if (callbacks.onClick) {
        setListener(billboard, 'leftClick', function(position) {

          callbacks.onClick(getIndex());
        });
      }
    }

    return billboard;
  }

  insertBillboard(index, position, callbacks) {
    this._orderedBillboards.splice(index, 0, this.createBillboard(position, callbacks));
  }

  addBillboard(position, callbacks) {
    let billboard = this.createBillboard(position, callbacks);
    this._orderedBillboards.push(billboard);
    return billboard;
  }

  addBillboards(positions, callbacks) {
    var index = 0;
    for (; index < positions.length; index++) {
      this.addBillboard(positions[index], callbacks);
    }
  }

  updateBillboardsPositions(positions) {
    var index = 0;
    for (; index < positions.length; index++) {
      this.getBillboard(index).position = positions[index];
    }
  }

  countBillboards() {
    return this._orderedBillboards.length;
  }

  getBillboard(index) {
    return this._orderedBillboards[index];
  }

  removeBillboard(index) {
    this._billboards.remove(this.getBillboard(index));
    this._orderedBillboards.splice(index, 1);
  }

  remove() {
    this._billboards.removeAll();
    this._primitives.remove(this._billboards);
  }

  setOnTop() {
    this._primitives.raiseToTop(this._billboards);
  }
}

function setListener(primitive, type, callback) {
  primitive[type] = callback;
}
export default BillboardGroup;
