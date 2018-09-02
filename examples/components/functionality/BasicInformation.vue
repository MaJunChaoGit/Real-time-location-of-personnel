<template>
  <div id="infoContainer" class="rp-basicinformation">
    <span class="rp-basicinformation__item">
      <label>{{transLon}}经:  <b>{{lon|convertDigitalToDegrees('lon', lon)}}</b></label>
    </span>
    <span class="rp-basicinformation__item">
      <label>{{transLat}}纬:  <b>{{lat|convertDigitalToDegrees('lat', lat)}}</b></label>
    </span>
    <span class="rp-basicinformation__item rp-basicinformation__item-xs">
      <label>视角高度:  <b>{{ viewHeight }}</b> 米</label>
    </span>
  </div>
</template>

<script>
import Picker from 'ex/src/Picker';
import { getBreakPoints, getClientWidth } from 'ex/utils/dom';
// 组件公开化
export default {
  name: 'RpBasicInformation',

  data() {
    return {
      lon: '0',
      lat: '0',
      height: '0',
      viewHeight: '25834697.41',
      lonText: '',
      latText: ''
    };
  },

  mounted() {
    // 调用pick组件
    let pp = new Picker(global.viewer, this.setPosition);
    // 允许拾取
    pp.setPickAbled(true);
  },

  methods: {
    // 回调函数
    setPosition: function(obj, prop, value) {
      // 设置变量的值
      this[prop] = value;
      return true;
    }
  },

  filters: {
    // 经纬度转换度分秒
    convertDigitalToDegrees: (value, type) => {
      if (!value) {
        return;
      }
      const num = 60;
      let degree = value ? parseInt(value, 0) : '0';
      let tmp = value % 1 * 60;
      let minute = parseInt(tmp, 0);
      let second = tmp % 1 * 60;
      let degrees = '' + degree + '°' + Math.abs(minute) + '′' + Math.abs(second.toFixed(2)) + '″ ';
      return degrees;
    }
  },

  computed: {
    transLon: function() {
      this.lonText = this.lon > 0 ? '东' : '西';
      return this.lonText;
    },
    transLat: function() {
      this.latText = this.lat > 0 ? '北' : '南';
      return this.latText;
    }
  }
};
</script>
