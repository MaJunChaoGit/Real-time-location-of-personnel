import defined from 'cesium/Core/defined';
import PinBuilder from 'cesium/Core/PinBuilder';
import VerticalOrigin from 'cesium/Scene/VerticalOrigin';
import Color from 'cesium/Core/Color';
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
    // 默认直接开启集群功能
    this.enable(enabled);
    // 集群标识的颜色, 默认天空蓝
    this.color = Color.SKYBLUE;
    // 集群最小融合像素
    this.setPixelRange(pixelRange);
    // 集群最小数目
    this.setMinimumClusterSize(minimumClusterSize);
    // 移除集群事件
    this.removeListener = null;
    // 开启集群处理事件
    this.clusteringHandle();
  }

  /**
   * 设置集群标识的的颜色
   * @Author   MJC
   * @DateTime 2018-12-24
   * @version  1.0.0
   * @param    {Color}   color 集群标识的颜色值
   */
  setPinColor(color) {
    if (!color) throw new Error('请传入正确颜色值');
    this.color = color;
  }
  /**
   * 开启集群和关闭集群功能
   * @Author   MJC
   * @DateTime 2018-12-24
   * @version  1.0.0
   * @param    {Boolean}   checked 开启或关闭
   * @return   {[type]}           [description]
   */
  enable(checked) {
    this.dataSource.clustering.enabled = checked;
  }
  /**
   * 设置融合范围像素大小
   * @Author   MJC
   * @DateTime 2018-12-24
   * @version  1.0.0
   * @param    {Number}   value 当两个目标相离多少像素时进行如何
   */
  setPixelRange(value) {
    if (value && this.pixelRange !== value) {
      this.pixelRange = value;
      this.dataSource.clustering.pixelRange = this.pixelRange;
    }
  }
  /**
   * 设置最小融合数量
   * @Author   MJC
   * @DateTime 2018-12-24
   * @version  1.0.0
   * @param    {Number}   value 当融合范围内最低有多少个目标时，进行融合
   */
  setMinimumClusterSize(value) {
    if (value && this.minimumClusterSize !== value) {
      this.minimumClusterSize = value;
      this.dataSource.clustering.minimumClusterSize = this.minimumClusterSize;
    }
  }
  /**
   * 设置融合标识的样式
   * @Author   MJC
   * @DateTime 2018-12-24
   * @version  1.0.0
   * @param    {Color}   color 设置融合小标识的颜色
   */
  clusteringHandle() {
    if (defined(this.removeListener)) {
      this.removeListener();
      this.removeListener = null;
    } else {
      this.removeListener = this.dataSource.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
        // 隐藏默认的label
        cluster.label.show = false;
        // 显示billboard
        cluster.billboard.show = true;
        // 必须要加上id才可以正常使用
        cluster.billboard.id = cluster.label.id;
        // 设置垂直底部居中
        cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;
        // 设置标识小标志
        cluster.billboard.image = this.pinBuilder.fromText(clusteredEntities.length.toString(), this.color, 48).toDataURL();
      });
    }
    // 重置下融合命令
    let pixelRange = this.dataSource.clustering.pixelRange;
    this.setPixelRange(0);
    this.setPixelRange(pixelRange);
  }
};
export default Clustering;
