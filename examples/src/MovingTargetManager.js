import {
  MovingTarget,
  MovingTargetCollection,
  Clustering,
  TypeEnum
} from 'source/index.js';

class MovingTargetManager {
  constructor(url) {
    // 设置一个分类对象, 便于之后的集群操作
    this.classification;
    // 初始化WebSocket以及hooks
    this.socket = new WebSocket(url);
    this.socket.onOpen = this.open;
    this.socket.onMessage = this.message;
    this.socket.onClose = this.close;
    this.socket.onError = this.error;
  }
  /**
   * websocket的open方法
   * @Author   MJC
   * @DateTime 2019-01-04
   * @version  1.0.0
   * @return   {[type]}   [description]
   */
  open() {
    console.log('WebSocket通信开始');
    // 开启动目标标牌点击以及绑定功能
    MovingTargetCollection.withInfobox();
  }
  /**
   * websocket的message方法
   * @Author   MJC
   * @DateTime 2019-01-04
   * @version  1.0.0
   * @param    {[type]}   event [description]
   * @return   {[type]}         [description]
   */
  message(event) {
    let arr = this.classifiTargets(event.data);
    this.parseBatchData(arr);
  }
  /**
   * websocket的close方法
   * @Author   MJC
   * @DateTime 2019-01-04
   * @version  1.0.0
   * @return   {[type]}   [description]
   */
  close() {
    console.log('WebSocket通信关闭');
  }
  /**
   * websocket的error方法
   * @Author   MJC
   * @DateTime 2019-01-04
   * @version  1.0.0
   * @return   {[type]}   [description]
   */
  error() {
    console.log('WebSocket通信错误');
  }
  /**
   * 对动目标进行分类管理
   * @Author   MJC
   * @DateTime 2019-01-04
   * @version  1.0.0
   * @param    {[type]}   data [description]
   * @return   {[type]}        [description]
   */
  classifiTargets(data) {
    let tempArr = [];
    data.forEach(val => {
      // 获取当前分类对象, 如果没有定义的话就定义一个, 之后开始填充数据
      if (!this.classification[val.options.type]) {
        // 初始化分类对象
        this.classification[val.options.type] = {};
        // 初始化id数组
        this.classification[val.options.type]['idArrays'] = [];
        // 初始化动目标分类集合对象
        this.classification[val.options.type]['collection'] = new MovingTargetCollection(global.viewer);
        // 开启动目标融合功能
        let custering = new Clustering({
          dataSource: this.classification[val.options.type]['collection']._dataSource
        });
        // 设置集群的标识的颜色
        custering.setPinColor(TypeEnum[val.options.type].color);
        // 每次新建集合绑定新的目标
        MovingTargetCollection.bindEntityWithInfobox();
      }
      // 将id存入方便管理
      this.classification[val.options.type]['id'].push(val.id);
      // 临时数据用于存放当前批次的数据
      tempArr.push(val);
    });
    return tempArr;
  }
  /**
   * 解析每个批次的动目标数据
   * @Author   MJC
   * @DateTime 2019-01-04
   * @version  1.0.0
   * @param    {[type]}   array [description]
   * @return   {[type]}         [description]
   */
  parseBatchData(array) {
    // 遍历解析数据，如果没有创建该目标信息，那么新建一个动目标
    // 如果已经有该数据了，直接改变坐标点
    array.forEach(val => {
      if (this.classification[val.options.type]['idArrays'].indexOf(val.id) < 0) {
        // 新增动目标到指定的分类集合中
        this.classification[val.options.type]['collection'].add(new MovingTarget(val));
      } else {
        // 获取集合，并获取到该数据坐标信息，然后根据id获取其对象进行增量数据添加
        let collection = this.classification[val.options.type]['collection'];
        // 获取target对象
        let target = collection.getById(val.id);
        // 对其增量改变坐标
        target.pushPositions(val.timePositions);
      }
    });
  }
};
export default MovingTargetManager;
