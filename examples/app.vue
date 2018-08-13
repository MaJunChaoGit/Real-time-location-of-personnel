<template>
  <div>
    <h1>{{ title }}</h1>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        title: '标题'
      };
    },
    mounted() {
      this.title = 'Hello World';
    },
    methods: {
      setMessage(msg) {
        this.message = msg;
      }
    }
  };
</script>