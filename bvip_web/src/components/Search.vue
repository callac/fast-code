<template>
  <div class="search">
    <input-base
      class="search-input"
      :id="id"
      v-model="keyword"
      :config="inputConfig"/>
    <label class="iconfont icon-search" :for="id"></label>
  </div>
</template>

<script>
import { debounce } from 'throttle-debounce'

function emitKeyword() {
  this.$emit('search', this.keyword)
}

// 封装的输入查询组件
export default {
  name: 'Search',
  props: {
    id: String,
    inputConfig: Object,
  },
  data() {
    return {
      keyword: '',
    }
  },
  computed: {
    $id() {
      return this.id || 'search'
    },
  },
  watch: {
    keyword() {
      this.emitKeyword()
    },
  },
  methods: {
    emitKeyword: debounce(500, emitKeyword),
  },
}
</script>
