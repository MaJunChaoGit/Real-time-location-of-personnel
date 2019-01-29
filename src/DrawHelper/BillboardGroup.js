import Color from 'cesium/Core/Color';
import Cartesian3 from 'cesium/Core/Cartesian3';
import BillboardCollection from 'cesium/Scene/BillboardCollection';
import ScreenSpaceEventType from 'cesium/Core/ScreenSpaceEventType';
import ScreenSpaceEventHandler from 'cesium/Core/ScreenSpaceEventHandler';
import HorizontalOrigin from 'cesium/Scene/HorizontalOrigin';
import VerticalOrigin from 'cesium/Scene/VerticalOrigin';

const iconUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAKTWlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVN3WJP3Fj7f92UPVkLY8LGXbIEAIiOsCMgQWaIQkgBhhBASQMWFiApWFBURnEhVxILVCkidiOKgKLhnQYqIWotVXDjuH9yntX167+3t+9f7vOec5/zOec8PgBESJpHmomoAOVKFPDrYH49PSMTJvYACFUjgBCAQ5svCZwXFAADwA3l4fnSwP/wBr28AAgBw1S4kEsfh/4O6UCZXACCRAOAiEucLAZBSAMguVMgUAMgYALBTs2QKAJQAAGx5fEIiAKoNAOz0ST4FANipk9wXANiiHKkIAI0BAJkoRyQCQLsAYFWBUiwCwMIAoKxAIi4EwK4BgFm2MkcCgL0FAHaOWJAPQGAAgJlCLMwAIDgCAEMeE80DIEwDoDDSv+CpX3CFuEgBAMDLlc2XS9IzFLiV0Bp38vDg4iHiwmyxQmEXKRBmCeQinJebIxNI5wNMzgwAABr50cH+OD+Q5+bk4eZm52zv9MWi/mvwbyI+IfHf/ryMAgQAEE7P79pf5eXWA3DHAbB1v2upWwDaVgBo3/ldM9sJoFoK0Hr5i3k4/EAenqFQyDwdHAoLC+0lYqG9MOOLPv8z4W/gi372/EAe/tt68ABxmkCZrcCjg/1xYW52rlKO58sEQjFu9+cj/seFf/2OKdHiNLFcLBWK8ViJuFAiTcd5uVKRRCHJleIS6X8y8R+W/QmTdw0ArIZPwE62B7XLbMB+7gECiw5Y0nYAQH7zLYwaC5EAEGc0Mnn3AACTv/mPQCsBAM2XpOMAALzoGFyolBdMxggAAESggSqwQQcMwRSswA6cwR28wBcCYQZEQAwkwDwQQgbkgBwKoRiWQRlUwDrYBLWwAxqgEZrhELTBMTgN5+ASXIHrcBcGYBiewhi8hgkEQcgIE2EhOogRYo7YIs4IF5mOBCJhSDSSgKQg6YgUUSLFyHKkAqlCapFdSCPyLXIUOY1cQPqQ28ggMor8irxHMZSBslED1AJ1QLmoHxqKxqBz0XQ0D12AlqJr0Rq0Hj2AtqKn0UvodXQAfYqOY4DRMQ5mjNlhXIyHRWCJWBomxxZj5Vg1Vo81Yx1YN3YVG8CeYe8IJAKLgBPsCF6EEMJsgpCQR1hMWEOoJewjtBK6CFcJg4Qxwicik6hPtCV6EvnEeGI6sZBYRqwm7iEeIZ4lXicOE1+TSCQOyZLkTgohJZAySQtJa0jbSC2kU6Q+0hBpnEwm65Btyd7kCLKArCCXkbeQD5BPkvvJw+S3FDrFiOJMCaIkUqSUEko1ZT/lBKWfMkKZoKpRzame1AiqiDqfWkltoHZQL1OHqRM0dZolzZsWQ8ukLaPV0JppZ2n3aC/pdLoJ3YMeRZfQl9Jr6Afp5+mD9HcMDYYNg8dIYigZaxl7GacYtxkvmUymBdOXmchUMNcyG5lnmA+Yb1VYKvYqfBWRyhKVOpVWlX6V56pUVXNVP9V5qgtUq1UPq15WfaZGVbNQ46kJ1Bar1akdVbupNq7OUndSj1DPUV+jvl/9gvpjDbKGhUaghkijVGO3xhmNIRbGMmXxWELWclYD6yxrmE1iW7L57Ex2Bfsbdi97TFNDc6pmrGaRZp3mcc0BDsax4PA52ZxKziHODc57LQMtPy2x1mqtZq1+rTfaetq+2mLtcu0W7eva73VwnUCdLJ31Om0693UJuja6UbqFutt1z+o+02PreekJ9cr1Dund0Uf1bfSj9Rfq79bv0R83MDQINpAZbDE4Y/DMkGPoa5hpuNHwhOGoEctoupHEaKPRSaMnuCbuh2fjNXgXPmasbxxirDTeZdxrPGFiaTLbpMSkxeS+Kc2Ua5pmutG003TMzMgs3KzYrMnsjjnVnGueYb7ZvNv8jYWlRZzFSos2i8eW2pZ8ywWWTZb3rJhWPlZ5VvVW16xJ1lzrLOtt1ldsUBtXmwybOpvLtqitm63Edptt3xTiFI8p0in1U27aMez87ArsmuwG7Tn2YfYl9m32zx3MHBId1jt0O3xydHXMdmxwvOuk4TTDqcSpw+lXZxtnoXOd8zUXpkuQyxKXdpcXU22niqdun3rLleUa7rrStdP1o5u7m9yt2W3U3cw9xX2r+00umxvJXcM970H08PdY4nHM452nm6fC85DnL152Xlle+70eT7OcJp7WMG3I28Rb4L3Le2A6Pj1l+s7pAz7GPgKfep+Hvqa+It89viN+1n6Zfgf8nvs7+sv9j/i/4XnyFvFOBWABwQHlAb2BGoGzA2sDHwSZBKUHNQWNBbsGLww+FUIMCQ1ZH3KTb8AX8hv5YzPcZyya0RXKCJ0VWhv6MMwmTB7WEY6GzwjfEH5vpvlM6cy2CIjgR2yIuB9pGZkX+X0UKSoyqi7qUbRTdHF09yzWrORZ+2e9jvGPqYy5O9tqtnJ2Z6xqbFJsY+ybuIC4qriBeIf4RfGXEnQTJAntieTE2MQ9ieNzAudsmjOc5JpUlnRjruXcorkX5unOy553PFk1WZB8OIWYEpeyP+WDIEJQLxhP5aduTR0T8oSbhU9FvqKNolGxt7hKPJLmnVaV9jjdO31D+miGT0Z1xjMJT1IreZEZkrkj801WRNberM/ZcdktOZSclJyjUg1plrQr1zC3KLdPZisrkw3keeZtyhuTh8r35CP5c/PbFWyFTNGjtFKuUA4WTC+oK3hbGFt4uEi9SFrUM99m/ur5IwuCFny9kLBQuLCz2Lh4WfHgIr9FuxYji1MXdy4xXVK6ZHhp8NJ9y2jLspb9UOJYUlXyannc8o5Sg9KlpUMrglc0lamUycturvRauWMVYZVkVe9ql9VbVn8qF5VfrHCsqK74sEa45uJXTl/VfPV5bdra3kq3yu3rSOuk626s91m/r0q9akHV0IbwDa0b8Y3lG19tSt50oXpq9Y7NtM3KzQM1YTXtW8y2rNvyoTaj9nqdf13LVv2tq7e+2Sba1r/dd3vzDoMdFTve75TsvLUreFdrvUV99W7S7oLdjxpiG7q/5n7duEd3T8Wej3ulewf2Re/ranRvbNyvv7+yCW1SNo0eSDpw5ZuAb9qb7Zp3tXBaKg7CQeXBJ9+mfHvjUOihzsPcw83fmX+39QjrSHkr0jq/dawto22gPaG97+iMo50dXh1Hvrf/fu8x42N1xzWPV56gnSg98fnkgpPjp2Snnp1OPz3Umdx590z8mWtdUV29Z0PPnj8XdO5Mt1/3yfPe549d8Lxw9CL3Ytslt0utPa49R35w/eFIr1tv62X3y+1XPK509E3rO9Hv03/6asDVc9f41y5dn3m978bsG7duJt0cuCW69fh29u0XdwruTNxdeo94r/y+2v3qB/oP6n+0/rFlwG3g+GDAYM/DWQ/vDgmHnv6U/9OH4dJHzEfVI0YjjY+dHx8bDRq98mTOk+GnsqcTz8p+Vv9563Or59/94vtLz1j82PAL+YvPv655qfNy76uprzrHI8cfvM55PfGm/K3O233vuO+638e9H5ko/ED+UPPR+mPHp9BP9z7nfP78L/eE8/sl0p8zAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAECSURBVHjadM4hawIBAIbh704vnIdcUBSu6GHwBnemBcOYYX9gaXm/wLHhP7AZ1wbDsGgXYWITmU1Y0yDDYLDIoWGKvguL2z35he8zCAIpnZb2+2utVk+y7SulUmntdlMVCs/K5fo6HiXCUBSLj7guNJswGsF4DO02lErguh2iSML3L8lmYTDgj/kcymXI52+Fab7TapGo1wPD+BSOc2A6TQ4PB6jVvk1ZVkqOo0SWJWUyhqnt9kPDYXI4mUiz2ZfwvBs8D5bL/6frdXCcexFFwnU7VCrQ7cJmA3EM/T40GmDbb4ShDILg98d6fac4flC1eiHLMrVYLHQ+v8j3X3U66WcAg0DWYOv84r0AAAAASUVORK5CYII=';

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
      horizontalOrigin: HorizontalOrigin.CENTER,
      verticalOrigin: VerticalOrigin.CENTER,
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
          let handler = new ScreenSpaceEventHandler(global.viewer.scene.canvas);
          function onDrag(position) {
            billboard.position = position;
            for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
            callbacks.dragHandlers.onDrag && callbacks.dragHandlers.onDrag(getIndex(), position);
          }
          function onDragEnd(position) {
            handler = handler && handler.destroy();
            global.viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
            global.viewer.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_UP);
            enableRotation(true);
            callbacks.dragHandlers.onDragEnd && callbacks.dragHandlers.onDragEnd(getIndex(), position);
          }

          global.viewer.screenSpaceEventHandler.setInputAction(function(movement) {
            var cartesian = _self._scene.camera.pickEllipsoid(movement.endPosition, _self.ellipsoid);
            if (cartesian) {
              onDrag(cartesian);
            } else {
              onDragEnd(cartesian);
            }
          }, ScreenSpaceEventType.MOUSE_MOVE);

          global.viewer.screenSpaceEventHandler.setInputAction(function(movement) {                  
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
