<template>
  <div class="address-manage">
    <div class="add-address">
      <select-base v-model="asset" :options="assetOptions"
                   :scrollbarProps="{isMobile}"/>
      <button class="add btn-green-fill" @click="show()">{{$t('add')}}</button>
    </div>
    <my-table :heads="heads" :data="addresses.records"
              :sort="false" :searching="searching">
      <button v-for="(a,i) in addresses.records"
              class="btn btn-red"
              :key="i"
              :slot="i+'-'+(heads.length-1)"
              @click="show(i)">
        {{$t('del')}}
      </button>
    </my-table>
    <pagination :config="pageConfig" @to="pageConfig.page=$event;getData()"/>
    <overlay-confirm v-if="showOverlay&&showOverlay.type==='del'" @cancel="showOverlay.rej()"
                     @close="showOverlay.rej()" @confirm="submit"/>
    <my-overlay v-else-if="showOverlay&&showOverlay.type==='add'" @close="showOverlay.rej()"
                :head="$t('add')+$t('asset.withdraw.address')">
      <my-input v-for="(item,i) in inputs"
                v-model="item.value"
                :item="item"
                :key="i"
                type="1"/>
      <button class="submit" @click="submit">{{$t('submit')}}</button>
    </my-overlay>
  </div>
</template>

<script>
import MyInput from 'components/client/MyInput'
import MyOverlay from 'components/client/MyOverlay'
import { dataDeal } from 'utils/DataDeal'
import { verifyCodeNumber } from 'utils/InputFormatter'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'AddressManage',
  beforeMount() {
    this.getSecurity().catch(this.snackBar.error)
    this.getData()
  },
  data() {
    return {
      asset: '',
      heads: [
        {
          name: 'name1',
          alias: 'name',
          formatter: (item, alias) => item.remark || item[alias],
          style: { width: '15%', textAlign: 'center' },
        },
        {
          name: 'coin',
          alias: 'asset',
          style: { width: '20%', textAlign: 'center' },
        },
        {
          name: 'asset.withdraw.address',
          alias: 'address',
          style: { width: '35%', textAlign: 'center' },
        },
        { name: 'memo', alias: 'memo', formatter: (item, alias) => item[alias] || '--' },
        {
          name: 'action',
          style: { width: '15%', textAlign: 'center' },
        },
      ],
      showOverlay: null,
      searching: false,
      pageConfig: {
        total: 1,
        pages: 1,
        page: 1,
        pageSize: 10,
      },
    }
  },
  computed: {
    ...mapState('user', ['addresses', 'assets', 'security']),
    assetOptions() {
      return [
        { name: this.$t('all'), value: '' },
        ...Object.keys(this.assets)
          .filter(k => this.assets[k].withdraw_status)
          .map(k => ({ name: k, value: k })),
      ]
    },
    assetOptions1() {
      return this.assetOptions.slice(1, this.assetOptions.length)
    },
    validateItems() {
      const validateItems = [
        {
          name: 'verify.code.phone',
          alias: 'sms_code',
          value: '',
          placeholder: '',
          preFormatter: verifyCodeNumber,
          errorText: '',
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode('sms_code'),
        },
        {
          name: 'verify.code.email',
          alias: 'email_code',
          value: '',
          placeholder: '',
          preFormatter: verifyCodeNumber,
          errorText: '',
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode('email_code'),
        },
        {
          name: 'verify.code.google',
          alias: 'two_step_code',
          value: '',
          preFormatter: verifyCodeNumber,
          placeholder: '',
          errorText: '',
        },
      ]
      return validateItems.filter(item => Object.keys(this.security).every((key) => {
        const include = item.name.includes(key)
        return !include || (include && this.security[key])
      }))
    },
    addressItems() {
      return this.heads
        .slice(0, 4)
        .map(item => ({
          ...item,
          value: '',
          placeholder: item.name,
          ...(item.alias === 'asset' ? {
            value: this.assetOptions1[0].value,
            inputType: 'select',
            options: this.assetOptions1,
          } : { required: item.alias !== 'memo' }),
          ...(item.alias === 'address' ? {
            sufFormatter: val => val.replace(/\s/g, ''),
          } : {}),
        }))
        .concat([...this.validateItems])
    },
    selectedAsset() {
      return this.assets[this.addressItems[1].value]
    },
    inputs() {
      return this.showOverlay.items
        .filter((item, i) => i !== 3 || (this.selectedAsset.has_memo && i === 3))
    },
  },
  watch: {
    assetOptions(val) {
      if (val) {
        this.asset = val[0].value
      }
    },
    asset() {
      this.getData()
    },
  },
  methods: {
    ...mapActions('user', ['getSecurity', 'getAssets', 'getWithdrawAddresses', 'addWithdrawAddress', 'delWithdrawAddress', 'getCodeAfterLogin']),
    getCode(alias) {
      const type = alias === 'email_code' ? '1' : '0'
      return this.getCodeAfterLogin({ type, use_type: 14 }).then(() => {
        this.snackBar.info(this.$t('verify.code.get.success'))
      })
    },
    getData() {
      this.searching = true;
      (Object.keys(this.assets).length > 0 ? Promise.resolve() : this.getAssets()).then(() => {
        if (!this.asset) this.asset = this.assetOptions[0] && this.assetOptions[0].value
        return this.getWithdrawAddresses({ asset: this.asset, ...this.pageC(this.pageConfig) })
          .then((res) => {
            this.pageConfig = {
              ...this.pageConfig,
              total: res.total,
              pages: Math.ceil(res.total / this.pageConfig.pageSize),
            }
          })
      }).catch(this.snackBar.error).then(() => {
        this.searching = false
      })
    },
    show(index = '') {
      return new Promise((res, rej) => {
        this.showOverlay = {
          res,
          rej,
          type: typeof index === 'string' ? 'add' : 'del',
          items: typeof index === 'string' ? this.addressItems : this.addresses.records[index],
        }
      }).then(() => {
        this.snackBar.info(this.$t(`${typeof index === 'string' ? 'add' : 'del'}.success`))
        this.showOverlay = null
      }).catch((e) => {
        if (!e) this.showOverlay = null
      })
    },
    submit() {
      const { items, type, res } = this.showOverlay
      let pro
      if (type === 'add') {
        const validItems = this.selectedAsset.has_memo
          ? items : items.slice(0, 3).concat(items.slice(4))
        const coinValue = validItems[1].value;
        const addressValue = validItems[2].value;
        if (addressValue !== '') {
          let { regex } = this.assets[coinValue];
          regex = new RegExp(regex);
          if (String(addressValue).match(regex) === null) {
            this.snackBar.error(this.$t('asset.withdraw.address') + this.$t('invalid'))
            return false;
          }
        }
        pro = this.validate(validItems)
          .then(() => this.addWithdrawAddress(dataDeal(items)))
      } else {
        pro = this.delWithdrawAddress(items.ID)
      }
      return pro
        .then(() => {
          res()
          this.getData()
        })
        .catch(this.snackBar.error)
    },
  },
  components: { MyOverlay, MyInput },
}
</script>
