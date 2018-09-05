<template>
  <div class="rp-button-group" :class="[
    'is-' + direction
  ]">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'RpButtonGroup',

  props: {
    direction: {
      type: String,
      default: 'row'
    }
  }
};
</script>