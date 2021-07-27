<template>
  <div v-if="data" class="rows">
    <div v-for="(d, i) in data" class="row" :key="i" :style="rowStyle" @click="$emit('rowClick',d)">
      <div v-for="(h, j) in heads" class="td" :key="j"
           v-html="(h.formatter?h.formatter(d,h.alias):d[h.alias])||0"
           :style="h.style"></div>
      <slot :name="i.toString()"/>
    </div>
  </div>
</template>

<script>
// 自定义表格行
export default {
  name: 'Rows',
  props: {
    heads: Array,
    data: Array,
    rowStyle: Object,
  },
  data() {
    return {}
  },
  methods: {},
}
</script>
