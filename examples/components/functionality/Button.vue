<template>
  <button
    class="rp-button"
    @click="handleClick"
    :type="nativeType"
    :class="[
      { 'is-round': round }
    ]"
  >
    <i class="rp-icon-loading" v-if="loading"></i>
    <i :class="icon" v-if="icon && !loading"></i>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>

<script>
export default {
  name: 'RpButton',

  props: {
    nativeType: {
      type: String,
      default: 'button'
    },
    icon: {
      type: String,
      default: ''
    },
    loading: Boolean,
    round: Boolean
  },

  methods: {
    handleClick(evt) {
      this.$emit('click', evt);
    }
  }
};
</script>