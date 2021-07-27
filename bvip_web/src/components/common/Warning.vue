<template>
  <div class="warning" v-html="text"></div>
</template>

<script>
// 警告组件
export default {
  name: 'Warning',
  props: ['text'],
}
</script>
