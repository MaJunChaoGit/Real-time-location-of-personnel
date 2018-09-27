import defined from 'cesium/Core/defined';
import DeveloperError from 'cesium/Core/DeveloperError';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import ScreenSpaceEventHandler from 'cesium/Core/ScreenSpaceEventHandler';
import Ellipsoid from 'cesium/Core/Ellipsoid';
import Cartesian3 from 'cesium/Core/Cartesian3';
import PolylineColorAppearance from 'cesium/Scene/PolylineColorAppearance';
import Billboard from 'cesium/Scene/Billboard';
import BillboardCollection from 'cesium/Scene/BillboardCollection';
import Label from 'cesium/Scene/Label';
import PointPrimitive from 'cesium/Scene/PointPrimitive';
import Rectangle from 'cesium/Core/Rectangle';

import RectanglePrimitive from './RectanglePrimitive';
import PolygonPrimitive from './PolygonPrimitive';
import PolylinePrimitive from './PolylinePrimitive';
import EllipsePrimitive from './EllipsePrimitive';
import CirclePrimitive from './CirclePrimitive';
import BillboardGroup from './BillboardGroup';
import MarkerCollection from './MarkerCollection';
import layerGroupHandle from './layerGroupHandle';
import MeasureArea from './MeasureArea';
import MeasureDistance from './MeasureDistance';

const ellipsoid = Ellipsoid.WGS84;

const defaultPolylineOptions = {
  width: 2,
  geodesic: true,
  appearance: new PolylineColorAppearance()
};

let DrawHelperCollection = {};
let vueCallback = null;
let showCtr = null;

class DrawHelper {
  /**
     * DrawHelper类
     * 绘制工具类
     * @constructor
     * @param {options} scene 绘制场景
     */
  constructor(scene) {
    if (defined(DrawHelperCollection[scene.id])) {
      return DrawHelperCollection[scene.id];
    }
    if (!defined(scene)) {
      throw new DeveloperError('请传入绘制场景');
    }

    this._scene = scene;
    this._surfaces = [];
    this.initialiseHandlers();
    this.enhancePrimitives();
    DrawHelperCollection[scene.id] = this;
  }

  initialiseHandlers() {
    let scene = this._scene;
    let _self = this;

    let handler = new ScreenSpaceEventHandler(scene.canvas);
    function callPrimitiveCallback(name, position) {
      if (_self._handlersMuted) return;
      let pickedObject = scene.drillPick(position);
      for (let i = 0; i < pickedObject.length; i++) {
        if (pickedObject[i] && pickedObject[i].primitive && pickedObject[i].primitive[name]) {
          pickedObject[i].primitive[name](position);
        }
      }
    }
    handler.setInputAction(
      function(movement) {
        callPrimitiveCallback('leftClick', movement.position);
      }, ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(
      function(movement) {
        callPrimitiveCallback('leftDoubleClick', movement.position);
      }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    handler.setInputAction(
      function(movement) {
        callPrimitiveCallback('leftUp', movement.position);
      }, ScreenSpaceEventType.LEFT_UP);
    handler.setInputAction(
      function(movement) {
        callPrimitiveCallback('leftDown', movement.position);
      }, ScreenSpaceEventType.LEFT_DOWN);
  }

  setListener(primitive, type, callback) {
    primitive[type] = callback;
  }

  muteHandlers(muted) {
    this._handlersMuted = muted;
  }

  registerEditableShape(surface) {
    let _self = this;
    setListener(surface, 'leftClick', function() {
      if (_self._handlersMuted) return;
      surface.setEditMode(true);
    });
  }

  startDrawing(cleanUp) {
    DrawHelper.disableAllEditMode();
    if (this.editCleanUp) {
      this.editCleanUp();
    }
    this.editCleanUp = cleanUp;
    this.muteHandlers(true);
  }

  stopDrawing() {
    if (this.editCleanUp) {
      this.editCleanUp();
      this.editCleanUp = null;
    }
    this.muteHandlers(false);
  }

  static disableAllEditMode() {
    DrawHelper.setEdited(undefined);
  }

  static setEdited(surface) {
    if (this._editedSurface && !this._editedSurface.isDestroyed()) {
      this._editedSurface.setEditMode(false);
    }
    this._editedSurface = surface;
  }

  /**
     * 绘制点
     * @param {}
     */

  startDrawingMarker(options) {
    options = options || {};
    this.startDrawing(
      function() {
        mouseHandler.destroy();
      }
    );
    let _self = this;
    let scene = this._scene;
    let primitives = options.collection || scene.primitives;

    let url = options.url || 'data:image/png;base64,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';
    let mouseHandler = new ScreenSpaceEventHandler(scene.canvas);
    mouseHandler.setInputAction(function(movement) {
      if (movement.position != null) {
        let cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
        if (cartesian) {
          _self.stopDrawing();
          let collection = primitives.add(new MarkerCollection());
          let primitive = collection.add({
            show: true,
            position: cartesian,
            horizontalOrigin: 0,
            verticalOrigin: 0,
            image: url
          });
          collection._primitives = primitives;
          primitive.setEditable();
          layerGroupHandle.addGeometry(collection);
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  }

  startDrawingPolygon() {
    this.startDrawingPolyshape(true);
  }

  startDrawingPolyline() {
    this.startDrawingPolyshape(false, defaultPolylineOptions);
  }

  startMeasureArea() {
    this.startDrawingPolyshape(true, {}, true);
  }

  startMeasureDistance() {
    this.startDrawingPolyshape(false, defaultPolylineOptions, true);
  }

  startDrawingPolyshape(isPolygon, options, isMeasure) {
    options = options || {};

    this.startDrawing(
      function() {
        primitives.remove(poly);
        if (markers !== null) {
          markers.remove();
        };
        mouseHandler.destroy();
      }
    );

    let _self = this;
    let scene = this._scene;
    let primitives = options.collection || scene.primitives;
    let poly;

    let minPoints = isPolygon ? 3 : 2;
    if (isPolygon) {
      if (isMeasure) {
        poly = new MeasureArea(options);
      } else {
        poly = new PolygonPrimitive(options);
      }
    } else {
      if (isMeasure) {
        poly = new MeasureDistance(options);
      } else {
        poly = new PolylinePrimitive(options);
      }
    }
    poly.asynchronous = false;
    poly._primitives = primitives;
    primitives.add(poly);

    let positions = [];
    let markers = new BillboardGroup(this._scene, undefined, primitives);
    let mouseHandler = new ScreenSpaceEventHandler(scene.canvas);

    mouseHandler.setInputAction(function(movement) {
      if (movement.position != null) {
        let cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
        if (cartesian) {
          if (positions.length === 0) {
            positions.push(cartesian.clone());
            markers.addBillboard(positions[0]);
          }
          if (positions.length >= minPoints) {
            poly.positions = positions;
            poly._createPrimitive = true;
          }
          cartesian.y += (1 + Math.random());
          positions.push(cartesian);
          markers.addBillboard(cartesian);
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    mouseHandler.setInputAction(function(movement) {
      let position = movement.endPosition;
      if (position != null) {
        if (positions.length === 0) {
        } else {
          let cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
          if (cartesian) {
            positions.pop();
            cartesian.y += (1 + Math.random());
            positions.push(cartesian);
            if (positions.length >= minPoints) {
              poly.positions = positions;
              poly._createPrimitive = true;
            }
            markers.getBillboard(positions.length - 1).position = cartesian;
          }
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    mouseHandler.setInputAction(function(movement) {
      _self.stopDrawing();
      positions.pop();
      let primitive = null;
      if (movement.position != null) {
        let cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
        if (cartesian) {
          positions.push(cartesian);
        }
      }
      if (isPolygon) {
        if (isMeasure) {
          primitive = new MeasureArea(options);
        } else {
          primitive = new PolygonPrimitive(options);
          layerGroupHandle.addGeometry(primitive);
        }
      } else {
        if (isMeasure) {
          primitive = new MeasureDistance(options);
        } else {
          primitive = new PolylinePrimitive(options);
          layerGroupHandle.addGeometry(primitive);
        }
      }
      primitive.setPositions(positions);
      _self.registerEditableShape(primitive);
      enhanceWithListeners(primitive);
      primitive._primitives = primitives;
      if (isMeasure) {addDeleteListener(primitive);}
      primitives.add(primitive);
    }, ScreenSpaceEventType.RIGHT_CLICK);
  }

  startDrawingExtent(options) {
    options = options || {};
    this.startDrawing(
      function() {
        if (extent != null) {
          primitives.remove(extent);
        }
        if (markers !== null) {
          markers.remove();
        }
        mouseHandler.destroy();
      }
    );

    let _self = this;
    let scene = this._scene;
    let primitives = this._scene.primitives;

    let firstPoint = null;
    let extent = null;
    let markers = null;

    let mouseHandler = new ScreenSpaceEventHandler(scene.canvas);

    function updateExtent(value) {
      if (extent == null) {
        options.extent = value;
        options.asynchronous = false;
        extent = new RectanglePrimitive(options);
        primitives.add(extent);
      }
      extent.setExtent(value);
      extent.rectangle = value;
      // update the markers
      let corners = getExtentCorners(value);
      // create if they do not yet exist
      if (markers == null) {
        markers = new BillboardGroup(scene, undefined);
        markers.addBillboards(corners);
      } else {
        markers.updateBillboardsPositions(corners);
      }
    }

    // Now wait for start
    mouseHandler.setInputAction(function(movement) {
      if (movement.position != null) {
        let cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
        if (cartesian) {
          if (extent == null) {
            // create the rectangle
            firstPoint = ellipsoid.cartesianToCartographic(cartesian);
            let value = getExtent(firstPoint, firstPoint);
            updateExtent(value);
          } else {
            _self.stopDrawing();
            let collection = options.collection || primitives;
            options.extent = getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian));
            options.asynchronous = true;
            let primitive = new RectanglePrimitive(options);
            collection.add(primitive);
            primitive.setEditable();
            if (typeof options.callback === 'function') {
              options.callback();
            }
          }
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    mouseHandler.setInputAction(function(movement) {
      let position = movement.endPosition;
      if (position != null) {
        if (extent !== null) {
          let cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
          if (cartesian) {
            let value = getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian));
            updateExtent(value);
          }
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);
  }

  startDrawingCircle(options) {
    options = options || {};
    this.startDrawing(
      function cleanUp() {
        if (circle != null) {
          primitives.remove(circle);
        }
        if (markers !== null) {
          markers.remove();
        };
        mouseHandler.destroy();
      }
    );

    let _self = this;
    let scene = this._scene;
    let primitives = this._scene.primitives;

    let circle = null;
    let markers = null;

    let mouseHandler = new ScreenSpaceEventHandler(scene.canvas);

    // Now wait for start
    mouseHandler.setInputAction(function(movement) {
      if (movement.position != null) {
        let cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
        if (cartesian) {
          if (circle == null) {
            // create the circle
            options.center = cartesian;
            options.radius = 0;
            options.asynchronous = false;
            circle = new CirclePrimitive(options);
            primitives.add(circle);
            markers = new BillboardGroup(scene, undefined);
            markers.addBillboards([cartesian]);
          } else {
            let collection = options.collection || primitives;
            options.center = circle.getCenter();
            options.radius = circle.getRadius();
            options.asynchronous = true;
            _self.stopDrawing();
            let primitive = new CirclePrimitive(options);
            collection.add(primitive);
            primitive.setEditable();
            if (typeof options.callback === 'function') {
              options.callback();
            }
          }
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    mouseHandler.setInputAction(function(movement) {
      let position = movement.endPosition;
      if (position != null) {
        if (circle !== null) {
          let cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
          if (cartesian) {
            circle.setRadius(Cartesian3.distance(circle.getCenter(), cartesian));
            markers.updateBillboardsPositions(cartesian);
          }
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);
  }

  startDrawingEllipse(options) {
    options = options || {};
    this.startDrawing(
      function cleanUp() {
        if (ellipse != null) {
          primitives.remove(ellipse);
        }
        if (markers !== null) {
          markers.remove();
        };
        mouseHandler.destroy();
      }
    );

    let _self = this;
    let scene = this._scene;
    let primitives = this._scene.primitives;

    let ellipse = null;
    let markers = null;

    let mouseHandler = new ScreenSpaceEventHandler(scene.canvas);

    // Now wait for start
    mouseHandler.setInputAction(function(movement) {
      if (movement.position != null) {
        let cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
        if (cartesian) {
          if (ellipse == null) {
            // create the circle
            options.center = cartesian;
            options.semiMajorAxis = 0;
            options.semiMinorAxis = 0;
            options.asynchronous = false;
            ellipse = new EllipsePrimitive(options);
            primitives.add(ellipse);
            markers = new BillboardGroup(scene, undefined);
            markers.addBillboards([cartesian]);
          } else {
            let collection = options.collection || primitives;
            options.center = ellipse.getCenter();
            options.semiMajorAxis = ellipse.getSemiMajorAxis();
            options.semiMinorAxis = ellipse.getSemiMinorAxis();
            options.asynchronous = true;
            _self.stopDrawing();
            let primitive = new EllipsePrimitive(options);
            collection.add(primitive);
            primitive.setEditable();
            if (typeof options.callback === 'function') {
              options.callback();
            }
          }
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    mouseHandler.setInputAction(function(movement) {
      let position = movement.endPosition;
      if (position != null) {
        if (ellipse !== null) {
          let cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
          if (cartesian) {
            ellipse.setSemiMajorAxis(Cartesian3.distance(ellipse.getCenter(), cartesian));
            ellipse.setSemiMinorAxis(Cartesian3.distance(ellipse.getCenter(), cartesian));
            markers.updateBillboardsPositions(cartesian);
          }
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);
  }

  selectByExtent(options, callback) {
    options = options || {};
    this.startDrawing(
      function() {
        if (extent != null) {
          primitives.remove(extent);
        }
        mouseHandler.destroy();
      }
    );
    options.color = options.color || 'rgba(255, 255, 255, 0.3)';
    let _self = this;
    let scene = this._scene;
    let primitives = this._scene.primitives;

    let firstPoint = null;
    let extent = null;
    let markers = null;

    let mouseHandler = new ScreenSpaceEventHandler(scene.canvas);

    function updateExtent(value) {
      if (extent == null) {
        options.extent = value;
        options.asynchronous = false;
        extent = new RectanglePrimitive(options);
        primitives.add(extent);
      }
      extent.setExtent(value);
      extent.rectangle = value;
    }

    function controlEarth(flag) {
      scene.screenSpaceCameraController.enableRotate = flag;
      scene.screenSpaceCameraController.enableTranslat = flag;
      scene.screenSpaceCameraController.enableTilt = flag;
      scene.screenSpaceCameraController.enableLook = flag;
      scene.screenSpaceCameraController.enableZoom = flag;
    };
    // Now wait for start
    mouseHandler.setInputAction(function(movement) {
      if (movement.position != null) {
        let cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
        if (cartesian) {
          controlEarth(false);
          firstPoint = ellipsoid.cartesianToCartographic(cartesian);
          let value = getExtent(firstPoint, firstPoint);
          updateExtent(value);
        }
      }
    }, ScreenSpaceEventType.LEFT_DOWN);

    mouseHandler.setInputAction(function(movement) {
      if (extent !== null) {
        _self.stopDrawing();
        if (typeof options.callback === 'function') {
          options.callback();
        }
        controlEarth(true);
        callback(extent.rectangle);
      }
    }, ScreenSpaceEventType.LEFT_UP);

    mouseHandler.setInputAction(function(movement) {
      let position = movement.endPosition;
      if (position != null) {
        if (extent !== null) {
          let cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
          if (cartesian) {
            let value = getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian));
            updateExtent(value);
          }
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);
  }

  enhancePrimitives() {
    let drawHelper = this;
    function setEditableForPoint() {

      if (this._editable) {
        return;
      }

      this._editable = true;

      let primitive = this;

      let _self = this;

      function enableRotation(enable) {
        drawHelper._scene.screenSpaceCameraController.enableRotate = enable;
      }
      /* eslint-disable no-unused-vars */
      setListener(primitive, 'leftDown', function(position) {

        function onDrag(position) {
          primitive.position = position;
          _self.executeListeners({name: 'drag', positions: position});
        }
        function onDragEnd(position) {
          handler.destroy();
          enableRotation(true);
          _self.executeListeners({name: 'dragEnd', positions: position});
        }

        let handler = new ScreenSpaceEventHandler(drawHelper._scene.canvas);

        handler.setInputAction(function(movement) {
          let cartesian = drawHelper._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
          if (cartesian) {
            onDrag(cartesian);
          } else {
            onDragEnd(cartesian);
          }
        }, ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction(function(movement) {
          onDragEnd(drawHelper._scene.camera.pickEllipsoid(movement.position, ellipsoid));
        }, ScreenSpaceEventType.LEFT_UP);

        enableRotation(false);

      });
      enhanceWithListeners(primitive);
    }

    Billboard.prototype.setEditable = setEditableForPoint;

    Label.prototype.setEditable = setEditableForPoint;

    PointPrimitive.prototype.setEditable = setEditableForPoint;

    function setEditMode(editMode) {
      // if no change
      if (this._editMode === editMode) {
        return;
      }
      // display markers
      if (editMode) {
        drawHelper.setEdited(this);
        let scene = drawHelper._scene;
        let _self = this;
        // create the markers and handlers for the editing
        if (this._markers == null) {
          let markers = new BillboardGroup(scene, undefined, this._primitives);
          /*
           eslint-disable no-inner-declarations
           */
          function onEdited() {
            _self.executeListeners({name: 'onEdited', positions: _self.positions});
          }
          let handleMarkerChanges = {
            dragHandlers: {
              onDrag: function(index, position) {
                _self.positions[index] = position;
                // updateHalfMarkers(index, _self.positions);
                _self._createPrimitive = true;
              },
              onDragEnd: function(index, position) {
                _self._createPrimitive = true;
                onEdited();
              }
            },
            onDoubleClick: function(index) {
              if (_self.positions.length < 3) {
                return;
              }
              // remove the point and the corresponding markers
              _self.positions.splice(index, 1);
              _self._createPrimitive = true;
              markers.removeBillboard(index);

              onEdited();
            }
          };

          // add billboards and keep an ordered list of them for the polygon edges
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

          // set on top of the polygon
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
    function setEditable() {
      if (this.setEditMode) {
        return;
      }

      let Primitive = this;
      Primitive.asynchronous = false;

      drawHelper.registerEditableShape(Primitive);

      Primitive.setEditMode = setEditMode;

      enhanceWithListeners(Primitive);

      Primitive.setEditMode(false);
    }
    PolylinePrimitive.prototype.setEditable = setEditable;

    PolygonPrimitive.prototype.setEditable = setEditable;

    RectanglePrimitive.prototype.setEditable = function() {

      if (this.setEditMode) {
        return;
      }

      let extent = this;
      let scene = drawHelper._scene;

      drawHelper.registerEditableShape(extent);
      extent.asynchronous = false;

      extent.setEditMode = function(editMode) {
        // if no change
        if (this._editMode === editMode) {
          return;
        }
        // display markers
        if (editMode) {
          // make sure all other shapes are not in edit mode before starting the editing of this shape
          drawHelper.setEdited(this);
          // create the markers and handlers for the editing
          if (this._markers == null) {
            let markers = new BillboardGroup(scene, undefined);
            function onEdited() {
              extent.executeListeners({name: 'onEdited', extent: extent.extent});
            }
            let handleMarkerChanges = {
              dragHandlers: {
                onDrag: function(index, position) {
                  let corner = markers.getBillboard((index + 2) % 4).position;
                  extent.setExtent(getExtent(ellipsoid.cartesianToCartographic(corner), ellipsoid.cartesianToCartographic(position)));
                  markers.updateBillboardsPositions(getExtentCorners(extent.extent));
                },
                onDragEnd: function(index, position) {
                  onEdited();
                }
              }
            };
            markers.addBillboards(getExtentCorners(extent.extent), handleMarkerChanges);
            this._markers = markers;
            // add a handler for clicking in the globe
            this._globeClickhandler = new ScreenSpaceEventHandler(scene.canvas);
            this._globeClickhandler.setInputAction(
              function(movement) {
                let pickedObject = scene.pick(movement.position);
                // disable edit if pickedobject is different or not an object
                try {
                  if (!(pickedObject && !pickedObject.isDestroyed() && pickedObject.primitive)) {
                    extent.setEditMode(false);
                  }
                } catch (e) {
                  extent.setEditMode(false);
                }
              }, ScreenSpaceEventType.LEFT_CLICK);

            // set on top of the polygon
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
      };

      enhanceWithListeners(extent);

      extent.setEditMode(false);

    };

    EllipsePrimitive.prototype.setEditable = function() {

      if (this.setEditMode) {
        return;
      }
      let ellipse = this;
      let scene = drawHelper._scene;
      ellipse.asynchronous = false;
      drawHelper.registerEditableShape(ellipse);
      ellipse.setEditMode = function(editMode) {
        // if no change
        if (this._editMode === editMode) {
          return;
        }
        // display markers
        if (editMode) {
          // make sure all other shapes are not in edit mode before starting the editing of this shape
          drawHelper.setEdited(this);
          let _self = this;
          // create the markers and handlers for the editing
          if (this._markers == null) {
            let markers = new BillboardGroup(scene, undefined);
            function getMarkerPositions() {
              return _self.getEllipseBoundary();
            }
            function onEdited() {
              ellipse.executeListeners({name: 'onEdited', center: ellipse.getCenter(), semiMajorAxis: ellipse.getSemiMajorAxis(), semiMinorAxis: ellipse.getSemiMinorAxis(), rotation: 0});
            }
            let handleMarkerChanges = {
              dragHandlers: {
                onDrag: function(index, position) {
                  let distance = Cartesian3.distance(ellipse.getCenter(), position);
                  if (index % 2 === 0) {
                    ellipse.setSemiMinorAxis(distance);
                  } else {
                    ellipse.setSemiMajorAxis(distance);
                  }
                  markers.updateBillboardsPositions(getMarkerPositions());
                },
                onDragEnd: function(index, position) {
                  onEdited();
                }
              }
            };
            markers.addBillboards(getMarkerPositions(), handleMarkerChanges);
            this._markers = markers;
            // add a handler for clicking in the globe
            this._globeClickhandler = new ScreenSpaceEventHandler(scene.canvas);
            this._globeClickhandler.setInputAction(
              function(movement) {
                let pickedObject = scene.pick(movement.position);
                if (!(pickedObject && pickedObject.primitive)) {
                  _self.setEditMode(false);
                }
              }, ScreenSpaceEventType.LEFT_CLICK);

            // set on top of the polygon
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
      };

      enhanceWithListeners(ellipse);

      ellipse.setEditMode(false);
    };

    CirclePrimitive.prototype.setEditable = function() {
      if (this.setEditMode) {
        return;
      }

      let circle = this;
      let scene = drawHelper._scene;

      circle.asynchronous = false;

      drawHelper.registerEditableShape(circle);

      circle.setEditMode = function(editMode) {
        // if no change
        if (this._editMode === editMode) {
          return;
        }
        // display markers
        if (editMode) {
          // make sure all other shapes are not in edit mode before starting the editing of this shape
          drawHelper.setEdited(this);
          let _self = this;
          // create the markers and handlers for the editing
          if (this._markers == null) {
            let markers = new BillboardGroup(scene, undefined);
            function getMarkerPositions() {
              return _self.getCircleCartesianCoordinates(Math.PI * 0.5);
            }
            function onEdited() {
              circle.executeListeners({name: 'onEdited', center: circle.getCenter(), radius: circle.getRadius()});
            }
            let handleMarkerChanges = {
              dragHandlers: {
                onDrag: function(index, position) {
                  circle.setRadius(Cartesian3.distance(circle.getCenter(), position));
                  markers.updateBillboardsPositions(getMarkerPositions());
                },
                onDragEnd: function(index, position) {
                  onEdited();
                }
              }
            };
            markers.addBillboards(getMarkerPositions(), handleMarkerChanges);
            this._markers = markers;
            // add a handler for clicking in the globe
            this._globeClickhandler = new ScreenSpaceEventHandler(scene.canvas);
            this._globeClickhandler.setInputAction(
              function(movement) {
                let pickedObject = scene.pick(movement.position);
                if (!(pickedObject && pickedObject.primitive)) {
                  _self.setEditMode(false);
                }
              }, ScreenSpaceEventType.LEFT_CLICK);

            // set on top of the polygon
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
      };
      enhanceWithListeners(circle);
      circle.setEditMode(false);
    };
  }

  static pushFunction(callback, showAttr) {
    vueCallback = callback;
    showCtr = showAttr;
  }

  static getFunction(callback, showAttr) {
    return { vueCallback: vueCallback,
      showCtr: showCtr};
  }
}

function getExtentCorners(value) {
  return ellipsoid.cartographicArrayToCartesianArray([Rectangle.northwest(value), Rectangle.northeast(value), Rectangle.southeast(value), Rectangle.southwest(value)]);
}

function getExtent(mn, mx) {
  let e = new Rectangle();

  // Re-order so west < east and south < north
  e.west = Math.min(mn.longitude, mx.longitude);
  e.east = Math.max(mn.longitude, mx.longitude);
  e.south = Math.min(mn.latitude, mx.latitude);
  e.north = Math.max(mn.latitude, mx.latitude);

  // Check for approx equal (shouldn't require abs due to re-order)
  let epsilon = 0.0000001;

  if ((e.east - e.west) < epsilon) {
    e.east += epsilon * 2.0;
  }

  if ((e.north - e.south) < epsilon) {
    e.north += epsilon * 2.0;
  }

  return e;
};

function getDisplayLatLngString(cartographic, precision) {
  return cartographic.longitude.toFixed(precision || 3) + ', ' + cartographic.latitude.toFixed(precision || 3);
}

function clone(from, to) {
  if (from == null || typeof from !== 'object') return from;
  if (from.constructor !== Object && from.constructor !== Array) return from;
  if (from.constructor === Date || from.constructor === RegExp || from.constructor === Function ||
        from.constructor === String || from.constructor === Number || from.constructor === Boolean) {return new from.constructor(from);}

  to = to || new from.constructor();

  for (let name in from) {
    to[name] = typeof to[name] === 'undefined' ? clone(from[name], null) : to[name];
  }

  return to;
}

// function fillOptions(options, defaultOptions) {
//     options = options || {};
//     let option;
//     for(option in defaultOptions) {
//         if(options[option] === undefined) {
//             options[option] = clone(defaultOptions[option]);
//         }
//     }
// }

// // shallow copy
// function copyOptions(options, defaultOptions) {
//     let options = clone(options), option;
//     for(option in defaultOptions) {
//         if(options[option] === undefined) {
//             options[option] = clone(defaultOptions[option]);
//         }
//     }
//     return options;
// }

function setListener(primitive, type, callback) {
  primitive[type] = callback;
}

function addDeleteListener(primitive) {
  primitive.billboards = primitive._primitives.add(new BillboardCollection());
  let button = primitive.billboards.add({
    position: primitive.positions[primitive.positions.length - 1],
    image: 'data:image/png;base64,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',
    width: 15,
    height: 15,
    horizontalOrigin: 1,
    verticalOrigin: 0
  });
  setListener(button, 'leftClick', function() {
    primitive.destroy();
  });
}

function ajax(url, func) {
  let ajax = new XMLHttpRequest();
  ajax.open('get', url);
  ajax.send();
  ajax.onreadystatechange = function() {
    if (ajax.readyState === 4 && ajax.status === 200) {
      let attributes = JSON.parse(ajax.responseText).data.Symbol;
      func(attributes);
    }
  };
}

function enhanceWithListeners(element) {
  element._listeners = {};
  element.addListener = function(name, callback) {
    this._listeners[name] = (this._listeners[name] || []);
    this._listeners[name].push(callback);
    return this._listeners[name].length;
  };

  element.executeListeners = function(event, defaultCallback) {
    if (this._listeners[event.name] && this._listeners[event.name].length > 0) {
      let index = 0;
      for (;index < this._listeners[event.name].length; index++) {
        this._listeners[event.name][index](event);
      }
    } else {
      if (defaultCallback) {
        defaultCallback(event);
      }
    }
  };
}

export default DrawHelper;
