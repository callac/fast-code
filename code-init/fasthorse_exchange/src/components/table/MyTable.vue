<template>
  <div class="table-base-wrap">
    <component :is="type==='base'?'TableBase':'TableExtend'"
               :heads="showHeads"
               :data="searching?[]:data"
               :noHead="noHead"
               :trStyle="trStyle"
               :evenTrStyle="evenTrStyle"
               :headTrStyle="headTrStyle"
               :scrollbarProps="scrollbarProps"
               @clickTh="emitSort"
               @clickTr="$emit('clickTr', $event.tr)">
      <template v-for="(h, i) in heads" :slot="'th-'+i">
        <icon-up-down v-if="sort&&h.sort!==false&&!h.type"
                      size=".14rem"
                      :type="sortType.alias===h.alias?upDown[sortType.value]:''"
                      :key="i"/>
        <check-box v-if="h.type==='select'&&h.selectAll"
                   :value="allSelected"
                   :style="h.checkboxStyle"
                   @error="$emit('error','MyTable: '+$event)"
                   @input="$emit('selectAll', !allSelected)"
                   :key="i"/>
      </template>
      <template v-for="(d,i) in data">
        <template v-for="(h, j) in heads" :slot="'td-'+i+'-'+j">
          <check-box v-if="h.type==='select'"
                     :value="d.tableSelected"
                     :style="h.checkboxStyle"
                     @error="$emit('error','MyTable: '+$event)"
                     @input="$emit('select', i)"
                     :key="i+'0'+j"/>
          <slot v-else :name="i+'-'+j"/>
        </template>
      </template>
    </component>
    <div v-if="searching" class="load">
      <loading :color="loadingColor || '#fff'" size=".3rem"/>
    </div>
    <no-result v-else-if="data&&data.length<1&&!noBody" :tipText="tipText"/>
  </div>
</template>

<script>
import { TableBase, TableExtend } from '@livelybone/vue-table'
import IconUpDown from 'components/common/IconUpDown'
import NoResult from 'components/common/NoResult'
import { getNext } from 'utils/Sort'

const sortTypes = ['', 'desc', 'asc']
const upDown = { '': '', 'desc': 'up', 'asc': 'down' }
export default {
  name: 'MyTable',
  components: { NoResult, IconUpDown, TableBase, TableExtend },
  props: {
    // 表格头部信息
    heads: Array,
    // 需要渲染的数据
    data: Array,
    // 是否显示排序按钮，是否可排序
    sort: {
      default: true,
      type: Boolean,
    },
    // thead tr 样式
    headTrStyle: Object,
    // tr 样式
    trStyle: Object,
    // 基数行 tr 样式
    evenTrStyle: Object,
    // 是否显示表格头部
    noHead: Boolean,
    // 是否显示表格数据
    noBody: Boolean,
    // 数据 data 是否正在被查询
    searching: Boolean,
    // Loading 组件颜色
    loadingColor: String,
    // 表格类型，可选值：['base', 'extend']，分别对应组件 @livelybone/vue-table 的 TableBase 和 TableExtend
    type: {
      type: String,
      default: 'base',
    },
    // 设置 TableExtend 的最大高度及客户端类型（pc, mobile）, 详情请看组件 @livelybone/vue-table
    scrollbarProps: Object,
    // 设置 NoResult 组件的提示语
    tipText: String,
  },
  // mounted() {
  //   document.getElementsByClassName('tr')
  // },
  data() {
    return {
      sortType: {
        alias: '', // 排序使用的字段
        value: '', // 排序类型，正序 vs 倒序
      },
      upDown,
    }
  },
  computed: {
    showHeads() {
      return this.heads && this.heads.map(item => ({
        ...item,
        name: item.needTran === false ? item.name : this.$t(item.name),
      }))
    },
    allSelected() {
      if (this.data) return this.data.every(item => item.tableSelected)
      return false
    },
  },
  methods: {
    emitSort({ th }) {
      const h = this.heads[th]
      if (this.sort && h.sort !== false && h.alias) {
        const { alias } = h
        const value = alias === this.sortType.alias ? getNext(sortTypes, this.sortType.value) : 'desc'
        this.sortType = {
          alias,
          value,
        }
        this.$emit('sort', this.sortType)
      }
    },
  },
}
</script>
