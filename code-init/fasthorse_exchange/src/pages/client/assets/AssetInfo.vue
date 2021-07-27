<template>
  <page-container :title="$t('asset.details')" class="asset-info container-inner article-wrap">
    <div v-if="info" class="content">
      <div class="head">
        <div class="icon-wrap">
          <img v-if="info.icon" class="icon" :src="info.icon" alt="">
          <div v-else class="icon">{{info.asset_code.slice(0,1)}}</div>
        </div>
        <div class="right">
          <h3>
            {{info.asset_code}}
            <span class="full-name">{{info.full_name}}</span>
          </h3>
          <p class="desc">{{info.desc}}</p>
        </div>
      </div>
      <div v-for="(itemG, k) in items" class="card" :class="k+'-info'" :key="k">
        <h4>{{$t('info.'+k)}}</h4>
        <div class="info" v-for="(item,i) in itemG" :key="i">
          <span class="name">{{$t(item.name)}}</span>
          <a v-if="item.link&&info[item.alias]"
             class="value font-main"
             :href="info[item.alias]">
            {{ellipsis(info[item.alias]||'--', 60)}}</a>
          <span v-else class="value" :class="{'font-main': item.em||item.link}">
            {{item.formatter?item.formatter(info[item.alias])
            :ellipsis(info[item.alias]||'--', 60)}}</span>
        </div>
      </div>
      <div class="card">
        <h4>{{$t('asset.details-1')}}</h4>
        <div class="detail-intro" v-html="info.detail"></div>
      </div>
    </div>
  </page-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'AssetsList',
  data() {
    return {
      items: {
        base: [
          { name: 'asset.full-name', alias: 'full_name' },
          { name: 'asset.official-website', alias: 'official_website', link: true },
          { name: 'asset.white-paper', alias: 'white_paper', link: true },
          { name: 'asset.block-query', alias: 'block_query', link: true },
          { name: 'asset.founding-team', alias: 'founding_team' },
          { name: 'asset.recommend-organization', alias: 'recommend_organization' },
        ],
        issue: [
          {
            name: 'asset.issue-date',
            alias: 'release_time',
            formatter: val => this.dateFormatter(val, 'YYYY-MM-DD'),
          },
          { name: 'asset.total-supply', alias: 'release_total', em: true },
          { name: 'asset.circulating-supply', alias: 'circulation_total', em: true },
        ],
      },
    }
  },
  computed: {
    ...mapState('market', ['assetsInfo']),
    assetCode() {
      return this.$route.params.assetCode
    },
    info() {
      return this.assetsInfo[this.assetCode]
    },
  },
  watch: {
    assetCode() {
      this.getInfo()
    },
  },
  methods: {
    ...mapActions('market', ['getAssetInfo']),
    getInfo() {
      if (this.assetCode) this.getAssetInfo(this.assetCode).catch(this.snackBar.error)
    },
  },
  beforeMount() {
    this.getInfo()
  },
}
</script>
