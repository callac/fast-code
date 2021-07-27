<template>
  <overlay class="overlay-confirm" @click="$emit('close')">
    <div class="float-win" :style="{width:winWidth+'px'}">
      <h2 v-if="head">{{head}}</h2>
      <div class="overlay-content">
        <p v-if="!hideTip">{{tipText || ($t('sure')+$t('del')+$t('ma'))}}</p>
        <slot/>
      </div>
      <div class="btn-group">
        <div class="o-btn" @click="$emit('confirm')">{{confirmText || $t('sure')}}</div>
        <div class="o-btn" @click="$emit('cancel')">{{cancelText || $t('cancel-1')}}</div>
      </div>
    </div>
  </overlay>
</template>

<script>
export default {
  name: 'OverlayConfirm',
  props: {
    head: String,
    tipText: String,
    confirmText: String,
    cancelText: String,
    winWidth: Number,
    hideTip: Boolean,
  },
  data() {
    return {}
  },
  methods: {},
  components: {},
}
</script>
