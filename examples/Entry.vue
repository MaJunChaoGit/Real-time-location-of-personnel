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
    initScene.then(ready => {
      this.isReady = false;
    });
  },

  methods: {
    loaded() {
      // 请求动目标数据
      this.$http.get(api.movingTargets)
      .then(response => {
        let data = response.data;
        // 新建动目标集合
        let collection = new MovingTargetCollection(global.viewer);
        // 设置生命周期
        collection.setLifyCircle(data.overallStarttime, data.overallEndtime);
        // 设置时钟效率
        collection.setMultiplier(0.1);
        // 遍历数据添加动目标
        data.data.forEach(val => {
          collection.add(new MovingTarget(global.viewer, val));
        });
      })
      .catch(function(error) {
        console.log(error);
      });
    }
  }
};
</script>
