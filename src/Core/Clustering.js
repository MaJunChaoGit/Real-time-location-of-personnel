import defined from 'cesium/Core/defined';
import PinBuilder from 'cesium/Core/PinBuilder';
import VerticalOrigin from 'cesium/Scene/VerticalOrigin';
import TypeEnum from './TypeEnum';
/**
 * 集群控制类, 主要用于entity的集群功能
 */
class Clustering {
  constructor({
    dataSource = null,
    pixelRange = 15,
    minimumClusterSize = 2,
    enabled = true
  }) {
    if (!defined(dataSource)) {
      throw new Error('需要dataSource');
    }
    // 集群所需要的dataSource
    this.dataSource = dataSource;
    // 标识图标的Builder
    this.pinBuilder = new PinBuilder();
    // 是否开启集群功能
    this.enable(enabled);
    // 集群最小融合像素
    this.setPixelRange(pixelRange);
    // 集群最小数目
    this.setMinimumClusterSize(minimumClusterSize);
    // 移除集群事件
    this.removeListener = null;
    // 默认样式设置
    this.defaultStyle();
  }

  enable(checked) {
    this.dataSource.clustering.enabled = checked;
  }

  setPixelRange(value) {
    if (value && this.pixelRange !== value) {
      this.pixelRange = value;
      this.dataSource.clustering.pixelRange = this.pixelRange;
    }
  }
  setMinimumClusterSize(value) {
    if (value && this.minimumClusterSize !== value) {
      this.minimumClusterSize = value;
      this.dataSource.clustering.minimumClusterSize = this.minimumClusterSize;
    }
  }

  defaultStyle() {
    if (defined(this.removeListener)) {
      this.removeListener();
      this.removeListener = null;
    } else {
      this.removeListener = this.dataSource.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
        cluster.label.show = false;
        cluster.billboard.show = true;
        cluster.billboard.id = cluster.label.id;
        cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;
        let color = null;
        for (let type in TypeEnum) {
          if (TypeEnum[type].name === clusteredEntities[0].options.type) {
            color = TypeEnum[type].color;
            break;
          }
        }

        cluster.billboard.image = this.pinBuilder.fromText(clusteredEntities.length.toString(), color, 48).toDataURL();
      });
    }

    let pixelRange = this.dataSource.clustering.pixelRange;
    this.setPixelRange(0);
    this.setPixelRange(pixelRange);
  }
};
export default Clustering;
