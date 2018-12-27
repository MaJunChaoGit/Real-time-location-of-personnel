<template>
  <div class="rp-tree">
    <div class="rp-tree__header">
      <i class="rp-icon-document"><span v-if="deviceType() === 'else'">&nbsp;RealTime Location</span></i>
      <i class="rp-icon-close" @click = "containerClose()"></i>
    </div>
    <div class="rp-tree__container">
      <el-row type="flex" align="middle">
        <el-col :span="24">
          <h4>信息设置</h4>
        </el-col>
      </el-row>
      <el-row type="flex" align="middle">
        <el-col :span="4" :offset="1">
          <label v-if="deviceType() === 'else'">建筑:</label>
          <span  v-else class="rp-tree__icon" v-if=""><i class="rp-icon--custom__build"></i></span>
        </el-col>
        <el-col :span="3">
          <el-switch
            v-model="buildInfo"
            @change="featureControl"
            active-color="#33a3d8"
            inactive-color="#1347af">
          </el-switch>
        </el-col>
      </el-row>
      <el-row type="flex" align="middle">
        <el-col :span="4"  :offset="1">
          <label v-if="deviceType() === 'else'">车辆:</label>
          <span  v-else class="rp-tree__icon"><i class="rp-icon--custom__car"></i></span>
        </el-col>
        <el-col :span="3">
          <el-switch
            v-model="targetInfo"
            @change="movingTargetControl"
            active-color="#33a3d8"
            inactive-color="#1347af">
          </el-switch>
        </el-col>
        <el-col :span="4" :offset="5">
          <label v-if="deviceType() === 'else'">点位:</label>
          <span  v-else class="rp-tree__icon"><i class="rp-icon--custom__location"></i></span>
        </el-col>
        <el-col :span="3">
          <el-switch
            v-model="pointInfo"
            active-color="#33a3d8"
            inactive-color="#1347af">
          </el-switch>
        </el-col>
      </el-row>
      <el-row type="flex" align="middle">
        <el-col :span="4" :offset="1">
          <label v-if="deviceType() === 'else'">区县:</label>
          <span  v-else class="rp-tree__icon"><i class="rp-icon--custom__borough"></i></span>
        </el-col>
        <el-col :span="3">
          <el-switch
            v-model="boroughInfo"
            active-color="#33a3d8"
            inactive-color="#1347af">
          </el-switch>
        </el-col>
        <el-col :span="4" :offset="5">
          <label v-if="deviceType() === 'else'">热力:</label>
          <span  v-else class="rp-tree__icon"><i class="rp-icon--custom__heatmap"></i></span>
        </el-col>
        <el-col :span="3">
          <el-switch
            v-model="heatmapInfo"
            active-color="#33a3d8"
            inactive-color="#1347af">
          </el-switch>
        </el-col>
      </el-row>
       <el-row type="flex" align="middle" v-if="deviceType() === 'else'">
        <el-col :span="24">
          <h4>风格设置</h4>
        </el-col>
      </el-row>
      <el-row type="flex" align="middle" v-if="deviceType() === 'else'">
        <el-col :span="4" :offset="1">
          <label>建筑:</label>
        </el-col>
        <el-col :span="7">
          <el-select v-model="buildStyle" placeholder="请选择风格" size="mini">
            <el-option
                v-for="item in buildStyleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="4" :offset="1">
          <label>地图:</label>
        </el-col>
        <el-col :span="7">
          <el-select v-model="mapStyle" placeholder="请选择风格" size="mini">
            <el-option
                v-for="item in mapStyleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { getDeviceType } from 'ex/utils/dom';
import MovingTargetCollection from 'source/Core/MovingTargetCollection';
export default {
  name: 'RpTree',

  data() {
    return {
      buildStyle: '1',
      buildStyleOptions: [{
        value: '0',
        label: '原始风格'
      }, {
        value: '1',
        label: '科技风格'
      }],
      mapStyle: '1',
      mapStyleOptions: [{
        value: '0',
        label: '原始风格'
      }, {
        value: '1',
        label: '科技风格'
      }],
      buildInfo: true,
      targetInfo: true,
      pointInfo: false,
      boroughInfo: false,
      heatmapInfo: false
    };
  },

  components: {
    
  },

  mounted() {
  
  },
  methods: {
    containerClose() {
      document.querySelector('.rp-tree').style.display = 'none';
    },
    deviceType() {
      return getDeviceType();
    },
    featureControl() {
      this.buildInfo = this.$store.getters.getBuild.build.show(this.buildInfo);
    },
    movingTargetControl() {
      this.targetInfo = MovingTargetCollection.visiableAllCollection(this.targetInfo);
    }
  }
};
</script>