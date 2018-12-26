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
            @change="pointInfoControl"
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
            @change="boroughInfoControl"
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
       <!-- <el-row type="flex" align="middle" v-if="deviceType() === 'else'">
        <el-col :span="24">
          <h4>风格设置</h4>
        </el-col>
      </el-row>
      <el-row type="flex" align="middle" v-if="deviceType() === 'else'">
        <el-col :span="4" :offset="1">
          <label>建筑:</label>
        </el-col>
        <el-col :span="7">
          <el-select v-model="buildStyle" placeholder="请选择风格" size="mini" @change="buildStyleControl">
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
          <el-select v-model="mapStyle" placeholder="请选择风格" size="mini" @change="mapStyleControl">
            <el-option
                v-for="item in mapStyleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-col>
      </el-row> -->
    </div>
  </div>
</template>

<script>
import { getDeviceType } from 'ex/utils/dom';
import MovingTargetCollection from 'source/Core/MovingTargetCollection';
import KmlLoader from 'source/Core/KmlLoader';
import GeojsonLoader from 'source/Core/GeojsonLoader';
export default {
  name: 'RpTree',

  data() {
    return {
      buildStyle: '1',
      buildStyleOptions: [{
        value: '0',
        label: '经典'
      }, {
        value: '1',
        label: '科技'
      }],
      mapStyle: '1',
      mapStyleOptions: [{
        value: '0',
        label: '经典'
      }, {
        value: '1',
        label: '科技'
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
  computed: {

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
    },
    pointInfoControl() {
      if (!this.$store.getters.getLocation()) {
        let dataSourcePromise = new KmlLoader(global.viewer, '../Assets/newYorkData/sampleGeocacheLocations.kml');
        this.$store.dispatch('set_location', dataSourcePromise);
      } else {
        this.$store.getters.getLocation().show = this.pointInfo;
      }
    },
    boroughInfoControl() {
      debugger
      if (!this.$store.getters.getBorough()) {
        let dataSourcePromise = new GeojsonLoader(global.viewer, '../Assets/newYorkData/sampleNeighborhoods.geojson');
        this.$store.dispatch('set_borough', dataSourcePromise);
      } else {
        this.$store.getters.getBorough().show = this.boroughInfo;
      }
    }
  }
};
</script>