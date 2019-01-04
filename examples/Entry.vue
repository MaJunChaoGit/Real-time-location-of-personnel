<template>
  <div class="rp-container">
    <div :id="mountedId" class="rp-content"></div>
    <transition name="fade">
      <rp-layout v-if="isReady" :feature="feature"></rp-layout>
    </transition>
    <rp-loading @after-leave="loaded" background="#fff"></rp-loading>
  </div>
</template>

<script>
import InitScene from 'ex/src/InitScene';
import MovingTargetManager from 'ex/src/MovingTargetManager';
import RpLayout from 'ex/components/layout/Layout';
import RpLoading from 'ex/components/functionality/Loading';
import api from './api/index';

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
        return resolve.entity;
      })
      .then(feature => {
        // 再复制INFOBOX,开启pickUp功能
        feature.pickUp();
        // 存下feature后面用
        this.$store.commit('SET_BUILD', feature);
        // 现加载页面HTML
        this.isReady = true;
      });
  },

  methods: {
    loaded() {
      // 请求动目标数据
      this.$http.get(api.lifeCircle)
        .then(response => {
          let data = response.data;
          // 设置动画声明周期
          global.viewer.setLifeCircle(data.overallStarttime, data.overallEndtime);
          // 设置时钟效率
          global.viewer.setMultiplier(0.1);
          MovingTargetManager(api.movingTargets)
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }
};
</script>
