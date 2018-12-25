<template>
  <div class="rp-tree">
    <div class="rp-tree__header">
      
      <i class="rp-icon-close" @click = "containerClose()"></i>
    </div>
    <div class="rp-tree__container">
      
    </div>
  </div>
</template>

<script>

export default {
  name: 'RpTree',

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
      document.querySelector('.rp-tree').style.display = 'none';
    }
  }
};
</script>