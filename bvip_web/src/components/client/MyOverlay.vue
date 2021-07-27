<template>
  <overlay class="my-overlay"
           @click="$emit('close')">
    <div class="window">
      <div class="header">{{head}} <span class="iconfont icon-del" @click="$emit('close')"></span>
      </div>
      <div class="content-wrap">
        <slot/>
      </div>
    </div>
  </overlay>
</template>

<script>
// 自定义弹出框
export default {
  name: 'MyOverlay',
  props: {
    head: String,
  },
}
</script>
