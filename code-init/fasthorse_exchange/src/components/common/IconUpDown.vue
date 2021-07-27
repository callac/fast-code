<template>
  <span class="icon-up-down" :style="{width: size, height: size}">
    <span class="iconfont icon-arrowdropdown-copy-1" :class="{'is': type==='down'}"></span>
    <span class="iconfont icon-arrowdropdown" :class="{'is': type==='up'}"></span>
  </span>
</template>

<script>
/**
 * @desc 一个组合图标，用于表格头部显示排序情况
 * @props {String} ['', 'up', 'down'] type
 * */
export default {
  name: 'IconUpDown',
  props: {
    size: String,
    type: String,
  },
}
</script>
