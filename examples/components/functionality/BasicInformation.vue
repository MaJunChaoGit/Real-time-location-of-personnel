<template>
  <div class="rp-basicinformation">
    <span class="rp-basicinformation__item rp-basicinformation__item-vs" id="rp-distance-legend">
    </span>
    <span class="rp-basicinformation__item">
      <label>{{transLon}}经:  <b>{{lon | convertDigitalToDegrees}}</b></label>
    </span>
    <span class="rp-basicinformation__item">
      <label>{{transLat}}纬:  <b>{{lat | convertDigitalToDegrees}}</b></label>
    </span>
    <span class="rp-basicinformation__item rp-basicinformation__item-xs">
      <label>高度:  <b>{{ viewHeight }} m</b></label>
    </span>
  </div>
</template>
<script>
import Picker from 'ex/src/Picker';

export default {
  name: 'RpBasicInformation',

  data() {
    return {
      lon: '0',
      lat: '0',
      height: '0',
      viewHeight: '25834697'
    };
  },

  mounted() {
    // 调用pick组件
    let pp = new Picker(global.viewer, this.setPosition);
    // 允许拾取
    pp.setPickAbled(true);
  },

  methods: {
    /**
     * Picker类中所使用的Proxy代理对象，我们将这个方法传入其set方法中，与Vue配合实现数据绑定
     * @Author   MJC
     * @DateTime 2018-09-03
     * @version  1.0.0
     * @param    {Object}   obj   proxy对象
     * @param    {String}   prop  lon, lat, height, viewHeight等字段属性
     * @param    {Boolean}  value 返回true完成赋值
     */
    setPosition: function(obj, prop, value) {
      // 设置变量的值
      this[prop] = value;
      return true;
    }
  },

  filters: {
    /**
     * 根据用户的经纬度精度需求所编写的转换方法，可以将经纬度转为度分秒展示
     * @Author   MJC
     * @DateTime 2018-09-03
     * @version  1.0.0
     * @param    {String}   value Vue过滤器中传入需要被过滤的初始值， 这里是经纬度
     * @return   {String}   经过转换后的经纬度 格式为120°11′11'
     */
    convertDigitalToDegrees: (value) => {
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
      return this.lon > 0 ? '东' : '西';
    },
    transLat: function() {
      return this.lat > 0 ? '北' : '南';
    }
  }
};
</script>
