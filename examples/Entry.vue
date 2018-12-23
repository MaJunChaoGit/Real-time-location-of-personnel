<template>
  <div class="rp-container">
    <div :id="mountedId" class="rp-content"></div>
    <rp-layout v-if="isReady"></rp-layout>
    <rp-loading @after-leave="loaded" background="#fff"></rp-loading>
  </div>
</template>

<script>
import InitScene from 'ex/src/InitScene';
import RpLayout from 'ex/components/layout/Layout';
import RpLoading from 'ex/components/functionality/Loading';
import api from './api/index';

import {
  MovingTarget,
  MovingTargetCollection
} from 'source/index.js';

export default {
  name: 'Entry',

  data() {
    return {
      mountedId: 'cesiumContainer',
      isReady: false
    };
  },

  components: {
    RpLayout,
    RpLoading
  },

  mounted() {
    // 1.优化加载顺序
    let initScene = new InitScene(this.mountedId);
    // 2、调整代码结构，使用promise进行异步处理
    initScene
      .then(resolve => {
        // 现加载页面HTML
        this.isReady = resolve.status;
        return resolve.entity;
      })
      .then(feature => {
        // 再复制INFOBOX,开启pickUp功能
        feature.pickUp();
      });
  },

  methods: {
    loaded() {
      // 请求动目标数据
      this.$http.get(api.movingTargets)
      .then(response => {
        let data = response.data;
        // 设置动画声明周期
        global.viewer.setLifyCircle(data.overallStarttime, data.overallEndtime);
        // 设置时钟效率
        global.viewer.setMultiplier(0.1);
        // 设置一个分类对象, 便于之后的集群操作
        let classification = {};
        // 遍历数据添分类动目标
        data.data.forEach(val => {
          // 获取当前分类数组, 如果没有定义的话就定义一个, 之后开始填充数据
          if (!classification[val.options.type]) classification[val.options.type] = [];
          classification[val.options.type].push(val);
        });
        // 遍历分类对象
        for (let key in classification) {
          // 新建动目标集合
          let collection = new MovingTargetCollection(global.viewer);
          classification[key].forEach(val => {
            collection.add(new MovingTarget(global.viewer, val));
          });
        }
        MovingTargetCollection.registerLeftClickEvent();
        MovingTargetCollection.bindWithInfobox();
      })
      .catch(function(error) {
        console.log(error);
      });
    }
  }
};
</script>
