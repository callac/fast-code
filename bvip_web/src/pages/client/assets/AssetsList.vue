<template>
  <page-container :title="$t('asset.list')" class="assets-list container-inner article-wrap">
    <div class="content">
      <h1>
        {{$t('asset.list')}}
        <div class="search-wrap">
          <input class="search"
                 type="text"
                 :value="keyword.currValue"
                 :placeholder="$t(keyword.placeholder)"
                 @input="setKeyword">
          <span class="iconfont icon-search"></span>
        </div>
      </h1>
      <query :queryFn="getList" :noResult="assets&&assets.length<1" :queryAgain="queryAgain"
             @error="log('ArticleList:', $event)">
        <router-link class="asset-item" v-for="(item, i) in assets"
                     :to="'/asset/'+item.asset_code" :key="i">
          <div class="icon-wrap">
            <img v-if="item.icon" class="icon" :src="item.icon" alt="">
            <div v-else class="icon">{{item.asset_code.slice(0,1)}}</div>
          </div>
          <div class="right">
            <h3>
              {{item.asset_code}}
              <span class="full-name">{{item.full_name}}</span>
            </h3>
            <p class="desc">{{item.desc}}</p>
          </div>
        </router-link>
      </query>
      <pagination :config="pageConfig" @to="pageConfig.page=$event;queryAgain=true"/>
    </div>
  </page-container>
</template>

<script>
import Debounce from 'utils/Debounce'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'AssetsList',
  data() {
    return {
      keyword: {
        currValue: '',
        placeholder: 'asset.search-1',
        value: '',
        debonce: new Debounce(),
      },
      pageConfig: {
        total: 1,
        pages: 1,
        page: 1,
        pageSize: 10,
      },
      queryAgain: false,
    }
  },
  computed: {
    ...mapState('market', ['assets']),
  },
  watch: {
    'keyword.value'() {
      this.queryAgain = true
    },
  },
  methods: {
    ...mapActions('market', ['getAssetsInfoList']),
    setKeyword(ev) {
      const { target: { value } } = ev
      this.keyword.currValue = value
      this.keyword.debonce.handle(() => {
        this.keyword.value = value
      })
    },
    getList() {
      return this.getAssetsInfoList({ search: this.keyword.value, ...this.pageC(this.pageConfig) })
        .then((res) => {
          this.pageConfig = {
            ...this.pageConfig,
            total: res.total,
            pages: Math.ceil(res.total / this.pageConfig.pageSize),
          }
          this.queryAgain = false
        })
    },
  },
}
</script>
