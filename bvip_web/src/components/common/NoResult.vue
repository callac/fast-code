<template>
  <transition name="fade">
    <div class="no-result" @click="$emit('click',$event)">{{tipText || $t('result.no')}}</div>
  </transition>
</template>

<script>
// 未查询到内容时显示的占位符
export default {
  name: 'NoResult',
  props: {
    tipText: String,
  },
}
</script>
