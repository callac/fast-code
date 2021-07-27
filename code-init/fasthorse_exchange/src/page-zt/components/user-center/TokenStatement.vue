<template>
  <div class="token-statement">
    <div class="inputs-wrap">
      <div class="time">
        <template v-for="(time, i) in showTime">
          <label :for="time.name" :class="i===0?'':'x'" :key="i">{{time.name}}</label>
          <datepicker v-model="time.value" :id="time.name" :key="i+'picker'"
                      :placeholder="time.placeholder"
                      :min="i===1?showTime[0].value:''"
                      :max="i===0?showTime[1].value:''"
                      :inputStyle="{fontSize: '.12rem'}"
                      :scrollbarProps="{isMobile}"/>
        </template>
      </div>
      <my-input v-for="(item, i) in filters" type="1" v-model="item.value" :item="item" :key="i"/>
    </div>
    <query :queryFn="getList" :noResult="tokenHistory.length<1"
           :queryAgain="queryAgain">
      <my-table :heads="heads" :data="tokenHistory" :sort="false"/>
    </query>
    <pagination :config="pageConfig" :noPage="true"
                @to="pageConfig.page=$event;queryAgain = true"/>
  </div>
</template>

<script>
import Datepicker from '@livelybone/vue-datepicker/lib/umd/Datepicker'
import MyInput from 'components/client/MyInput'
import Query from 'components/common/Query'
import { dataDeal } from 'utils/DataDeal'
import { validateDate } from 'utils/FormValidate'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'TokenStatement',
  beforeMount() {
    this.getBusinessType().catch(this.snackBar.error)
    if (Object.keys(this.assets).length < 1) {
      this.getAssets().catch(this.snackBar.error)
    } else {
      this.setAssetOptions()
    }
  },
  data() {
    const labelStyle = {
      textAlign: 'center',
      padding: '.05rem .1rem .05rem 0',
      fontSize: '0.12rem',
    }
    const inputStyle = { height: '.3rem', width: '1.2rem', fontSize: '0.12rem' }
    return {
      time: [
        {
          name: 'time',
          alias: 'start_time',
          aliasType: 'time',
          value: '',
          placeholder: 'time.start',
          validator: validateDate,
          errorText: 'time.error',
          required: false,
        },
        {
          name: '-',
          alias: 'end_time',
          aliasType: 'time',
          value: '',
          placeholder: 'time.end',
          needTran: false,
          validator: validateDate,
          errorText: 'time.error',
          required: false,
        },
      ],
      asset: {
        name: 'asset',
        alias: 'asset',
        value: '',
        inputType: 'select',
        options: [],
        labelStyle: { ...labelStyle, width: '.6rem' },
        inputStyle,
      },
      business: {
        name: 'type',
        alias: 'business',
        value: '',
        inputType: 'select',
        options: [{ name: 'type.choose', value: '', needTran: true }],
        labelStyle: { ...labelStyle, width: '.6rem' },
        inputStyle: { ...inputStyle, width: '2.8rem' },
      },
      heads: [
        {
          name: 'time',
          alias: 'time',
          formatter: (item, alias) => this.dateFormatter(item[alias]),
          style: { width: '20%', textAlign: 'center' },
        },
        { name: 'type', alias: 'business_desc', style: { width: '20%', textAlign: 'center' } },
        { name: 'coin', alias: 'asset', style: { width: '20%', textAlign: 'center' } },
        {
          name: 'amount',
          alias: 'change',
          style: { width: '20%', textAlign: 'center' },
          formatter: (item, alias) => `<span class="${this.getColor(item[alias])}">${item[alias]}</span>`,
        },
        {
          name: 'balance',
          alias: 'balance',
          style: { width: '20%', textAlign: 'center' },
          formatter: (item, alias) => this.numTrim(item[alias], 8),
        },
      ],
      pageConfig: {
        page: 1,
        pageSize: 10,
        currPageSize: 0,
      },
      queryAgain: false,
    }
  },
  computed: {
    ...mapState('user', ['tokenHistory', 'assets', 'businessTypes']),
    showTime() {
      return this.time.map((item, i) => {
        const type = i === 0 ? 'time.start' : 'time.end'
        if (i === 0) item.name = this.$t('time')
        item.placeholder = this.$t(type)
        item.errorText = this.$t('time.error')
        item.needTran = false
        return item
      })
    },
    filters() {
      return [
        // this.business,
        this.asset,
      ]
    },
  },
  watch: {
    assets() {
      this.setAssetOptions()
    },
    businessTypes() {
      this.business.options = [
        { name: 'type.choose', value: '', needTran: true },
        ...this.businessTypes,
      ]
    },
    'time.0.value'() {
      if (this.time[0].value && this.time[1].value) {
        this.pageConfig.page = 1
        this.queryAgain = true
      }
    },
    'time.1.value'() {
      if (this.time[0].value && this.time[1].value) {
        this.pageConfig.page = 1
        this.queryAgain = true
      }
    },
    'asset.value'() {
      this.pageConfig.page = 1
      this.queryAgain = true
    },
    'business.value'() {
      this.pageConfig.page = 1
      this.queryAgain = true
    },
  },
  methods: {
    ...mapActions('user', ['getTokenStatement', 'getAssets', 'getBusinessType']),
    setAssetOptions() {
      this.asset.options = [
        { name: 'coin.choose', value: '', needTran: true },
        ...Object.keys(this.assets).map(k => ({ name: k, value: k })),
      ]
    },
    getList() {
      this.queryAgain = false
      return this.getTokenStatement({
        ...dataDeal(this.showTime),
        ...dataDeal(this.filters),
        ...this.pageC(this.pageConfig),
      })
        .then((res) => {
          this.pageConfig = {
            ...this.pageConfig,
            currPageSize: res.records.length,
          }
        })
        .catch(this.snackBar.error)
    },
  },
  components: { MyInput, Query, Datepicker },
}
</script>
