<template>
  <div class="rp-right-side">
    <div class="rp-right-side__item rp-right-side__navigation" id="rp-outring"></div>
    <div class="rp-right-side__item">
      <rp-button-group direction="column">
        <rp-button round>a</rp-button>
        <rp-button round>b</rp-button>
      </rp-button-group>
    </div>
  </div>
</template>
<script>
import RpButtonGroup from './ButtonGroup';
import RpButton from '../functionality/Button';
export default {
  name: 'RpRightSide',

  components: {
    RpButtonGroup,
    RpButton
  }
};
</script>