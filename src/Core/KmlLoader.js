import KmlDataSource from 'cesium/DataSources/KmlDataSource';
/**
 * 加载geojson的类
 */
class KmlLoader {
  constructor(viewer, url, isClampGroud = false) {
    this.options = {
      camera: viewer.scene.camera,
      canvas: viewer.scene.canvas,
      clampToGround: isClampGroud
    };
    this._url = url;
    // 加载geojson
    this.promise = KmlDataSource.load(this._url, this.options);
    // 返回一个promise对象，便于让调用者知道何时加载完成
    return new Promise(resolve => {
      this.promise.then((dataSource) => {
        viewer.dataSources.add(dataSource);
        resolve(dataSource);
      });
    });
  }

};

export default KmlLoader;
