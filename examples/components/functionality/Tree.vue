<template>
  <div class="rp-tree">
    <div class="rp-tree__header">
      <i class="rp-icon-document" @click = "containerClose()">&nbsp;RealTime Location</i>

      <i class="rp-icon-close" @click = "containerClose()"></i>
    </div>
    <div class="rp-tree__container">
      <el-row>
        <el-col :span="8">
          <h4>风格设置</h4>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <label>建筑风格:</label>
        </el-col>
        <el-col :span="16">
          <el-select v-model="buildStyle" placeholder="请选择风格" size="mini">
            <el-option
                v-for="item in buildStyleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <label>地图风格:</label>
        </el-col>
        <el-col :span="16">
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
      <el-row>
        <el-col :span="8">
          <h4>信息设置</h4>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <label>建筑信息:</label>
        </el-col>
        <el-col :span="16">
          <el-switch
            v-model="buildInfo"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <label>车辆信息:</label>
        </el-col>
        <el-col :span="16">
          <el-switch
            v-model="targetInfo"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <label>点位信息:</label>
        </el-col>
        <el-col :span="16">
          <el-switch
            v-model="pointInfo"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <label>区县信息:</label>
        </el-col>
        <el-col :span="16">
          <el-switch
            v-model="boroughInfo"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <label>热力信息:</label>
        </el-col>
        <el-col :span="16">
          <el-switch
            v-model="heatmapInfo"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>

export default {
  name: 'RpTree',

  data() {
    return {
      buildStyle: "",
      buildStyleOptions: [{
        value: '0',
        label: '原始风格'
      }, {
        value: '1',
        label: '科技风格'
      }],
      mapStyle: "",
      mapStyleOptions: [{
        value: '0',
        label: '原始风格'
      }, {
        value: '1',
        label: '科技风格'
      }],
      buildInfo: false,
      targetInfo: false,
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
    }
  }
};
</script>