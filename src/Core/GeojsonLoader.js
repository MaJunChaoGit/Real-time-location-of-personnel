import GeoJsonDataSource from 'cesium/DataSources/GeoJsonDataSource';
import defined from 'cesium/Core/defined';
import Color from 'cesium/Core/Color';
import ClassificationType from 'cesium/Scene/ClassificationType';
import JulianDate from 'cesium/Core/JulianDate';
import BoundingSphere from 'cesium/Core/BoundingSphere';
import Ellipsoid from 'cesium/Core/Ellipsoid';
import HorizontalOrigin from 'cesium/Scene/HorizontalOrigin';
import VerticalOrigin from 'cesium/Scene/VerticalOrigin';
import DistanceDisplayCondition from 'cesium/Core/DistanceDisplayCondition';
/**
 * 加载geojson的类
 */
class GeojsonLoader {
  constructor(viewer, url, isClampGroud = false) {
    // 加载geojson
    let neighborhoodsPromise = GeoJsonDataSource.load(url, {
      isClampGroud: isClampGroud
    });
    // 返回一个promise对象，便于让调用者知道何时加载完成
    return new Promise(resolve => {
      neighborhoodsPromise.then(dataSource => {
        // 添加到dataSources中
        viewer.dataSources.add(dataSource);
        // 获取所有的entity
        let neighborhoodEntities = dataSource.entities.values;
        // 改变所有entity的样式风格
        this.changeStyle(neighborhoodEntities);
        // 将状态改为fulfilled
        resolve(dataSource);
      });
    });
  }
  /**
   * 改变实体polygon风格样式的方法
   * @Author   MJC
   * @DateTime 2019-01-02
   * @version  1.0.0
   * @param    {[type]}   entities [description]
   * @return   {[type]}            [description]
   */
  changeStyle(entities) {
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      if (defined(entity.polygon)) {
        // 获取geojson中neighborhood字段的entity
        entity.name = entity.properties.neighborhood;
        // 设置材质为科技蓝的随机色
        entity.polygon.material = Color.fromRandom({
          minimumRed: 0.129,
          maximumRed: 0.278,
          minimumGreen: 0.364,
          maximumGreen: 0.611,
          minimumBlue: 0.58,
          alpha: 0.1
        });
        // 对geojson进行分类
        entity.polygon.classificationType = ClassificationType.BOTH;
        // 获取polygon的坐标
        let polyPositions = entity.polygon.hierarchy.getValue(JulianDate.now()).positions;
        // 获取polygon的中点
        let polyCenter = BoundingSphere.fromPoints(polyPositions).center;
        // 获取地面法线与该笛卡尔积的相交位置，即地面点位坐标
        polyCenter = Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);

        entity.position = polyCenter;
        // 生成一个label
        entity.label = {
          text: entity.name,
          showBackground: false,
          scale: 0.6,
          horizontalOrigin: HorizontalOrigin.CENTER,
          verticalOrigin: VerticalOrigin.BOTTOM,
          distanceDisplayCondition: new DistanceDisplayCondition(10.0, 8000.0),
          disableDepthTestDistance: 100.0
        };
      }
    }
  }
}
export default GeojsonLoader;
