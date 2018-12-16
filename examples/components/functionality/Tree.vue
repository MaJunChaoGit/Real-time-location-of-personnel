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
            @change="heatmapControl"
            active-color="#33a3d8"
            inactive-color="#1347af">
          </el-switch>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { getDeviceType } from 'ex/utils/dom';
import MovingTargetCollection from 'source/Core/MovingTargetCollection';
import KmlLoader from 'source/Core/KmlLoader';
import GeojsonLoader from 'source/Core/GeojsonLoader';
import api from 'ex/api/index';
import CesiumHeatmap from 'source/Core/CesiumHeatmap';
import HeatmapImageryProvider from 'source/Scene/HeatmapImageryProvider';
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
      if (!this.$store.getters.getBorough()) {
        let dataSourcePromise = new GeojsonLoader(global.viewer, '../Assets/newYorkData/sampleNeighborhoods.geojson');
        this.$store.dispatch('set_borough', dataSourcePromise);
      } else {
        this.$store.getters.getBorough().show = this.boroughInfo;
      }
    },
    heatmapControl() {
      if (global.viewer.scene.imageryLayers._layers[1]) global.viewer.scene.imageryLayers._layers[1].show = this.heatmapInfo;
      else {
        this.$http.get(api.heatmap).then(response => {
          let data = this.getHeatMapData(response.data);
          let layer = new HeatmapImageryProvider({
            data: data,
            bounds: this.getBounds()
          });
          global.viewer.scene.imageryLayers.addImageryProvider(layer);
          global.viewer.setLayersStyles({
            brightness: 0.9,
            contrast: 0.3,
            hue: -0.1,
            saturation: 1.3,
            gamma: 1.6
          }, 1);
        });
      }
    },
    // 获取热力图数据
    getHeatMapData(currentData) {
      let points = [];
      let maxValue = 0;
      let minValue = 0;

      for (let i = 0; i < currentData.length; i++) {
          let x = currentData[i].lon;
          let y = currentData[i].lat;
          let value = currentData[i].value;

          maxValue = Math.max(maxValue, value);
          minValue = Math.min(minValue, value);

          points.push({
            x: x,
            y: y,
            value: value
          });
      }

      let data = {
        max: maxValue,
        points: points,
        min: minValue
      };
      return data;
    },

    getBounds() {
      let currentRectangle = global.viewer.scene.camera.computeViewRectangle();
      let bounds = {
        north: currentRectangle.north * 180.0 / Math.PI,
        west: currentRectangle.west * 180.0 / Math.PI,
        south: currentRectangle.south * 180.0 / Math.PI,
        east: currentRectangle.east * 180.0 / Math.PI
      };
      return bounds;
    }
  }
};
</script>