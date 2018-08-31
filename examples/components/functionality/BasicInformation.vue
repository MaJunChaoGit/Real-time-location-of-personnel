<template>
  <div class="rp-basicinfomation" id="infoContainer">
    <p>{{ transLon }}经&nbsp;&nbsp; <span>{{lon | convertDigitalToDegrees('lon',lon)}}  </span></p>
    <p>{{ transLat }}纬&nbsp;&nbsp; <span>{{lat | convertDigitalToDegrees('lat',lat)}}  </span></p>
    <p>海拔 <span>0.00</span> 米</p>
    <p>视角海拔高度 <span>{{viewHeight}}</span> 米</p>
  </div>
</template>

<script>
import Picker from 'ex/src/Picker';

// 组件公开化
export default {
  name: 'RpBasicInfomation',

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
      let degree = value ? parseInt(value) : '0';
      let tmp = value % 1 * 60;
      let minute = parseInt(tmp);
      let second = tmp % 1 * 60;
      let degrees = '' + degree + '°    ' + Math.abs(minute) + '′    ' + Math.abs(second.toFixed(2)) + '″    ';
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

<style scoped>
#infoContainer{
  display: flex;
  height: 28px;
  font-size: 12px;
  float: right;
}
#infoContainer>p{
  color: white;
  height: 28px;
  margin-right: 10px;
}
#infoContainer>p>span{
  color: yellow;
  height: 28px;
}
p,span{
  margin-top: 0px;
  margin-bottom: 0px;
}
</style>