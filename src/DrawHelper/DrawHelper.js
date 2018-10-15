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
import carToDegrees from 'ex/src/carToDegrees';
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

  startDrawingMarker(options, callback) {
    options = options || {};
    this.startDrawing(
      function() {
        mouseHandler.destroy();
      }
    );
    let _self = this;
    let scene = this._scene;
    let primitives = options.collection || scene.primitives;
    let url = 'data:image/png;base64,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';
    // let url = options.url || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAB+FJREFUeNrUmXtsHNUVxn+zM7Pr3fXajh/EDlEeEMiDwh9NeYQmgkaqSBuQGhWpFaUVohXI2EpQgyoqIZW0FUUVIKo+HCJFQiAQqZBSASamboKipEQidYJlkqyDE7/wem3vjtfe5+zsvbd/ZIzsjQOJE3thpE8a7c65c77znXPmzB1NKcU3+fDwDT++8QSMa7ZSOMx/Gzf7ge+78AK3Al1AHmgH2r/bcig7q/2aNXO6rXYtauDovUvWAY0e09dctXY9i9auR/PoBOuXk472o6Rg/EwHiTMdSMf+G9Cycfeh018LAkfuXfInIxh6evn9j1B/60ZIpXESCYQQyGwWj9+PruuYVVVQHiTadZT+916lkE4+v2n3od+WjMDhexrqgF11376n8eYfPY4YHiE9PIxwnEva6KZJsKEBvWExZ//1CmMnDrcAv7vnlQ/H5kpgzjWgFLtW3P+LxhW3fY/xk504udxX2hRsm4m+PsxolHX3PUJfw/LGvvdeA6WemKsfc1Lg0KaGl5ds2rpj9e1bsbq7EUJc8Rq6rlO9ejXdx1uJHGn9y+Yjw08uSBs9uLHhwfKlN+64+a4HsMJhCo6DkvKKUXAcrHCYm+96gPKlN+44uLHhwQUhIJVqXLXlYZLhbhzbRgkxA5pS+H0+FlVWUldTw6LKSvw+H5pSF13r2DbJcDertjyMVKpx3mvggw31G6puWLu5UniJpdMoKWcuZhhUVVYyEuslfPx/pGLDlNc2sGTNd1hcu5JEIkGhUJhhk0unqRW1VKxYu/mDDfUb7jsWPTZvCkjFQ/W33U0qEkHk86hC4Qt4lKIiGOTTjja62t/aGx/s2WRn0zXxwZ5NXe1v7f20o42KYBCPUjPsRD5PKhKh/ra7kYqH5lUBqdTWuuqlJHsHUUWF6/X5GI31Euk+sXfr31t/Nf05BxxtbdpK7ZIbflleVkcmn5+pQiZD7YrrkUptmbcaePeOxX7N8K70ZR0c20YWCjNg6jpDfaeRin0IQTGkYt9Q32lMXb/I1rFtynICzfCueveOxf55UUBKqr1lIQrJJHKWh5UmJdlUEimJUlQbrv1YLpNGkxJVVAcKKCST6GUhHDteDQxdcwWkUiknl/nCgWIUbBt/dR1SqZVISTGkUsvKKmso2Pas9pqUOLkMUqnUvKTQto7RiVwmYwnHRlPqojTIpFIsX3cnQvLY283blk1Pn7ebty0TkseW33InmVTqIltNKYRjk8tkrG0doxPzWcQfT6QTWwxNu6gd2pkMVU4d3/rhT7d2HdjX/8/tP94JdAOrNY/nxVt/8BP8jk4ik5m1/U6kE0ilPp7fLiRpi4x9vmVZxVKyRXUggMS5c9SvWcN1jz1D/+mOF5OjEULXLWH5uvV4EmkS4fCsY4c3EGBg7HOkpG1eCQil9g+cO/XyTbevuJC7RXOUdBxinZ34qqtZtnQ1xk3rKaRSpLvC2JbFbHOXpmn4DIOBc6cQSu2fVwI/64oNvH5L7bFsbnKDoWnkZ+lGCsiOjJAdGbmsNU2vl2xukmRi/NjPT8UG5n2cFop3BifGNjQYVeS+ZPa/3MPr9zM4MYZQvLMww5xUr54920XA57tkS71caFLi93r57LNPkVK9viAEHg3Ho6lUcv94JoGh64hCYc7QPR4mcpMkk5Otj4bjQwtCwFWh5XTkPGVeL0qIi/r65UAJgd/nozvah5Rqz4LuCz3+mdXe/3lfD7qGR9OQQlwxPJoGusb5gV6EonXBN7akZE9/YgSvYSAc54rhNQz6x6MIIX/zxB//IRacgFBqT+f5MP6AHw2uKPoa4A/46eztRii152q2duZMYEfv+EQuZ780lBrHa5pXVLxe02QoNU4uZ7/U/Ie/TkghFp6AOxu1dA72EPD7QanLij5KEfD76RzsQSrVMvWSXxICOwcSPYnJ5JuWk8VrGJfVfbyGgeVkSUwm39z++5d7SkrAfU9u+WR4gGAg8JUqoBTBQIDO6CBS0SKlZAolI/D0UOLoqBXfP6kKmIbxpQRMw2BCOozEY/uf3PXC0en7RCX9PiAVLSdHhr5UhanofzIaQSpalFJMR0kJPBOdaI9asda0R11SBdMwSHsUUSvW+utdf24v3qkr+RcaqWg5ORadVYWp6J8ci16I/ixbjSUn8NSzz7dG4vHWtO7Ba5oznPOaJhldIxKPtz317POtxelTkhTSNG06tFBTkyaU2n0yPkIwGHTHjQuRDQaDnIiPIpTaHWpq0kJNTdrXpQY0dw0PoD9npf4dsayDWUPHNAyUlJiGQdbQiVjWwees1AFABzwVzc2eiuZmrZQppE0jYAA+IDAu5GsnrBih8nJ0j4dQeTknrBjjQr4GBNzrDNdOq9y+XaPECuhc+CIZAEK7JzMfnY/HP0yZBhUVFWS8Jr3x+OHdk5mPgJB7nde106629jzXIH2moh8EKoGabqfwfkc8RsP113M8NsZZp3AAqHH/DxarcDUEjGsQgCkC5UAVUNGWtXtrLKutsvfclk8sq+39rN3jEjBdO8dFwd1SKhkBBUjXiYKLPGC8kc7uHRmOnvlPzv7IdTZf5LR07a8uh+fawjRNm8p/EyhzU6Mc8BeliHSdtoEskALSQM4lJHaGguqFyVTJFBBudDX3POuuO1WkappCeZdI3v3tqhUwrkH6TD/PT/X5ogYhp6XaFBkJyJ2h4FWR+P8AxL58JiRtssAAAAAASUVORK5CYII=';
    let mouseHandler = new ScreenSpaceEventHandler(scene.canvas);
    mouseHandler.setInputAction(function(movement) {
      if (movement.position != null) {
        let cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
        if (cartesian) {
          _self.stopDrawing();
          let collection = primitives.add(new MarkerCollection());
          collection.add({
            show: true,
            position: cartesian,
            horizontalOrigin: 0,
            verticalOrigin: 0,
            image: url
          });
          collection._primitives = primitives;
          callback(cartesian, collection._primitives);
          // primitive.setEditable();
          // layerGroupHandle.addGeometry(collection);
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

  startMeasureDistance(callback) {
    this.startDrawingPolyshape(false, defaultPolylineOptions, true, callback);
  }
  startDrawingCircle(options, callback) {
    options = options || {};
    let _self = this;
    let scene = this._scene;
    let primitives = this._scene.primitives;

    let circle = null;
    let markers = null;

    let mouseHandler = new ScreenSpaceEventHandler(scene.canvas);

    this.startDrawing(
      function() {
        if (circle !== null) primitives.remove(circle);
        if (markers !== null) markers.remove();
        mouseHandler.destroy();
      }
    );

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
            // _self.registerEditableShape(primitive);
            // enhanceWithListeners(primitive);
            if (typeof callback === 'function') {
              callback(carToDegrees(options.center), options.radius, primitive);
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

    return circle;
  }

  startDrawingPolyshape(isPolygon, options, isMeasure, callback) {
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
    let time = [];
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
          time.push(new Date());
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
          time.push(new Date());
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
      if (callback) callback(positions, time);
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

  // startDrawingCircle(options) {
  //   options = options || {};
  //   this.startDrawing(
  //     function cleanUp() {
  //       if (circle != null) {
  //         primitives.remove(circle);
  //       }
  //       if (markers !== null) {
  //         markers.remove();
  //       };
  //       mouseHandler.destroy();
  //     }
  //   );

  //   let _self = this;
  //   let scene = this._scene;
  //   let primitives = this._scene.primitives;

  //   let circle = null;
  //   let markers = null;

  //   let mouseHandler = new ScreenSpaceEventHandler(scene.canvas);

  //   // Now wait for start
  //   mouseHandler.setInputAction(function(movement) {
  //     if (movement.position != null) {
  //       let cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
  //       if (cartesian) {
  //         if (circle == null) {
  //           // create the circle
  //           options.center = cartesian;
  //           options.radius = 0;
  //           options.asynchronous = false;
  //           circle = new CirclePrimitive(options);
  //           primitives.add(circle);
  //           markers = new BillboardGroup(scene, undefined);
  //           markers.addBillboards([cartesian]);
  //         } else {
  //           let collection = options.collection || primitives;
  //           options.center = circle.getCenter();
  //           options.radius = circle.getRadius();
  //           options.asynchronous = true;
  //           _self.stopDrawing();
  //           let primitive = new CirclePrimitive(options);
  //           collection.add(primitive);
  //           primitive.setEditable();
  //           if (typeof options.callback === 'function') {
  //             options.callback();
  //           }
  //         }
  //       }
  //     }
  //   }, ScreenSpaceEventType.LEFT_CLICK);

  //   mouseHandler.setInputAction(function(movement) {
  //     let position = movement.endPosition;
  //     if (position != null) {
  //       if (circle !== null) {
  //         let cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
  //         if (cartesian) {
  //           circle.setRadius(Cartesian3.distance(circle.getCenter(), cartesian));
  //           markers.updateBillboardsPositions(cartesian);
  //         }
  //       }
  //     }
  //   }, ScreenSpaceEventType.MOUSE_MOVE);
  // }

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
  let firstPosition = carToDegrees(primitive.positions[0]);
  let lastPosition = carToDegrees(primitive.positions[primitive.positions.length - 1]);
  primitive.billboards = primitive._primitives.add(new BillboardCollection());
  let button = primitive.billboards.add({
    position: primitive.positions[primitive.positions.length - 1],
    image: 'data:image/png;base64,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',
    width: 15,
    height: 15,
    horizontalOrigin: -2,
    verticalOrigin: 2
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
