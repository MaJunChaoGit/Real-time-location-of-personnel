/* eslint-disable */
import defined from 'cesium/Core/defined';
import DeveloperError from 'cesium/Core/DeveloperError';
import DrawHelper from './DrawHelper';
import PrimitiveCollection from 'cesium/Scene/PrimitiveCollection';

export default (function() {
  let activeGroup;
  let activeLayer;
  let addNodeListFun = {};
  let layerGroupMap = new Map();
  let GeometryGroup = {};

  class layerGroupHandle {

    static deleteAllLayerGroup() {
      layerGroupMap.forEach(function(val) {
        val.forEach(function(v) {
          removeGeometry(v);
          global.ev.scene.primitives.remove(v);
        }, val);
      }, layerGroupMap);
      layerGroupMap.clear();
    }

    static addLayerGroup(key) {
      let layerGroup = new Map();
      layerGroupMap.set(key, layerGroup);
    }

    static deleteLayerGroup(key) {
      let layerGroup = layerGroupMap.get(key);
      layerGroup.forEach(function(v) {
        removeGeometry(v);
        global.ev.scene.primitives.remove(v);
      }, layerGroup);
      layerGroupMap.delete(key);
    }

    static clearLayerGroup(key) {
      let layerGroup = layerGroupMap.get(key);
      layerGroup.forEach(function(v) {
        removeGeometry(v);
        global.ev.scene.primitives.remove(v);
      }, layerGroup);
      layerGroup.clear();
    }

    // 控制图层的添加、删除、清空和显隐
    static addLayer(groupKey, layerKey) {
      let layer = new PrimitiveCollection();
      global.ev.scene.primitives.add(layer);
      layerGroupMap.get(groupKey).set(layerKey, layer);
    }

    static deleteLayer(groupKey, layerKey) {
      let layer = layerGroupMap.get(groupKey).get(layerKey);
      removeGeometry(layer);
      global.ev.scene.primitives.remove(layer);
      layerGroupMap.get(groupKey).delete(layerKey);
    }

    static clearLayer(groupKey, layerKey) {
      let layer = layerGroupMap.get(groupKey).get(layerKey);
      removeGeometry(layer);
    }

    // 设置和获取活动图层
    static setActiveLayer(groupKey, layerKey) {
      activeGroup = groupKey;
      activeLayer = layerKey;
    }

    static getActiveLayer() {
      let currentGroup = layerGroupMap.get(activeGroup);
      if (currentGroup) {
        return currentGroup.get(activeLayer);
      }
    }

    // 控制实体添加、移除、显隐及ID
    static addGeometry(geometry) {
      GeometryGroup.geometry = geometry;
    }

    // OK
    static removeGeometry(Key) {
      GeometryGroup[Key].destroy();
      delete GeometryGroup[Key];
    }

    static showGeometry(Key) {
      GeometryGroup[Key].show = !GeometryGroup[Key].show;
    }
    // OK
    static addNodeList(func) {
      GeometryGroup = new Proxy({}, {
        set: function(obj, prop, value) {
          let id = func();
          value.id = id;
          obj[id] = value;
          return true;
        }
      });
    }

    static showAllGeometry(keys) {
      for (let v in GeometryGroup) {
        GeometryGroup[v].show = (keys.indexOf(v) !== -1);
      }
    }
  }
  function removeGeometry(layer) {
    for (let i = layer._primitives.length - 1; i >= 0; i--) {
      layerGroupHandle.removeGeometry(layer._primitives[i].id);
    }
    for (let i = global.ev.scene.primitives._primitives.length - 1; i >= 0; i--) {
      if (defined(global.ev.scene.primitives._primitives[i].getType)) {
        global.ev.scene.primitives._primitives[i].destroy();
      }
    }
  }
  return layerGroupHandle;
})();
