<template>
  <div class="query">
    <loading v-if="searching" color="#fff" size=".3rem" :style="loadingStyle"/>
    <template v-else style="opacity:0">
      <slot v-if="!noResult"/>
      <no-result v-else color="#fff" :style="noResultStyle"/>
    </template>
  </div>
</template>

<script>
// 查询组件容器
export default {
  name: 'Query',
  props: {
    // 查询的函数
    queryFn: Function,
    // 是否无结果
    noResult: Boolean,
    // 是否再次查询
    queryAgain: Boolean,
    // NoResult 组件的样式
    noResultStyle: Object,
    // Loading 组件的样式
    loadingStyle: Object,
  },
  data() {
    return {
      // 是否正在查询
      searching: true,
    }
  },
  watch: {
    queryAgain(val) {
      if (val) {
        this.query()
      }
    },
    queryFn: {
      handler() {
        this.query()
      },
      immediate: true,
    },
  },
  methods: {
    query() {
      if (this.queryFn instanceof Function) {
        const res = this.queryFn()
        this.searching = true
        if (res.then && res.then instanceof Function) {
          res.then(() => {
            this.searching = false
          }).catch(this.snackBar.error)
        } else {
          this.$emit('error', new Error('Query: the result of prop queryFn is not a Promise'))
        }
      }
    },
  },
}
</script>
