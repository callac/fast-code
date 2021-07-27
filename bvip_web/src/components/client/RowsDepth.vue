<template>
  <rows :heads="heads" :data="data" :rowStyle="rowStyle" @rowClick="$emit('rowClick', $event)">
    <div v-for="(d,i) in data" class="bar" :key="i+'slot'" :slot="i"
         :style="{background: bg,width: max?'calc(100% * '+(d.size/max)+')':'0'}"></div>
  </rows>
</template>

<script>
import Rows from 'components/table/Rows'

// 深度列表组件的上半部分或者下半部分
export default {
  name: 'RowsDepth',
  props: {
    heads: Array,
    data: Array,
    rowStyle: Object,
    bg: String,
  },
  data() {
    return {}
  },
  computed: {
    max() {
      if (!this.data) return 0
      let num = 0
      this.data.forEach((item) => {
        num = +item.size > num ? +item.size : num
      })
      return num
    },
  },
  methods: {},
  components: { Rows },
}
</script>
