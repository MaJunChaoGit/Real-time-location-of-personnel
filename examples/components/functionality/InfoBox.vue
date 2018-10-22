<template>
  <div class="rp-infobox">
    <div class="rp-infobox__header">
      <i class="rp-icon-view"></i>
      <i class="rp-icon-close" @click = "containerClose()"></i>
    </div>
    <div class="rp-infobox__container">
      
    </div>
  </div>
</template>

<script>

export default {
  name: 'RpInfobox',

  data() {
    return {
      
    };
  },

  components: {
    
  },

  mounted() {
  
  },

  methods: {
    containerClose() {
      document.querySelector('.rp-infobox').style.display = 'none';
    }
  }
};
</script>