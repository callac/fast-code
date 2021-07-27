<template>
  <div class="drop-down" @click="toggle" ref="dropDown">
    <slot/>
    <span class="icon-arrow" :class="{ reverse: showPopper }"></span>
    <vue-popper
      v-if="showPopper"
      class="info-wrap"
      :arrowPosition="arrowPosition"
      :popperOptions="popperOptions"
    >
      <slot name="popper"/>
    </vue-popper>
  </div>
</template>

<script>
import VuePopper from '@livelybone/vue-popper'

export default {
  name: 'DropDown',
  components: { VuePopper },
  props: {
    // 箭头位置，https://www.npmjs.com/package/@livelybone/vue-popper
    arrowPosition: String,
    // popper.js 配置信息，https://www.npmjs.com/package/@livelybone/vue-popper
    popperOptions: Object,
  },
  data() {
    return {
      showPopper: false,
    }
  },
  methods: {
    toggle() {
      this.showPopper = !this.showPopper
    },
    hide({ target }) {
      if (
        this.$refs.dropDown !== target
        && !this.$refs.dropDown.contains(target)
      ) {
        this.showPopper = false
      }
    },
  },
  mounted() {
    window.addEventListener('click', this.hide, true)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.hide, true)
  },
}
</script>
