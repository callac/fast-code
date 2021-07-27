<template>
  <page-container class="sipc-content cash-pay-set" :title="title">
    <h1 class="content page-head">{{title}}</h1>
    <div class="content-wrap-1">
      <div class="tab-wrap">
        <div class="tab selected">{{$t('set')}}</div>
      </div>
      <p class="tab-tip">{{tip}}</p>
      <template v-if="add!==true">
        <no-result v-if="!showPayTypes.length"/>
        <button
          class="btn btn-add btn-main-fill"
          :class="{'btn-center': !showPayTypes.length}"
          @click="add=true"
        >
          {{$t('add')}}
        </button>
        <div v-if="showPayTypes.length" class="pay-types">
          <div v-for="(c, i) in showPayTypes" class="pay-type" :key="i">
            <div class="left">
              <p class="name" v-html="c.name"></p>
              <div v-if="c.image" class="qrcode">
                <img :src="require('assets/qrcode.jpg')" class="icon">
                <img :src="c.image" class="qrcode-origin">
              </div>
            </div>
            <div class="btn-group">
              <!--<button class="btn" @click="add=true">{{$t('add')}}</button>-->
              <button class="btn font-red" @click="del(c)">{{$t('del')}}</button>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="forms">
        <my-input type="1" v-model="types.value" :item="types"/>
        <template v-for="(item,i) in showItems">
          <my-input v-if="item.inputType!=='file'"
                    v-model="item.value" type="1"
                    :key="i+'-item'"
                    :item="item"/>
          <div v-else class="my-input type-1 dark" :key="i+'-item'">
            <span class="label">{{$t(item.name)}}</span>
            <my-file-input id="file"
                           :uploading="item.uploading"
                           :value="item.url"
                           @input="uploadQrcode(item, $event)"/>
          </div>
        </template>
        <h2>{{$t('verify.security')}}</h2>
        <div class="decoration"></div>
        <my-input v-for="(item,i) in showVerifyItems" v-model="item.value" type="1" :key="i"
                  :item="item"/>
        <div class="btn-group">
          <btn-once class="btn btn-main-fill btn-sure" :clickFn="submit" :useLoading="true">
            {{$t('sure')}}
          </btn-once>
          <button v-if="add" class="btn btn-gray-fill" @click="add=false">{{$t('cancel-1')}}
          </button>
        </div>
      </div>
    </div>
    <overlay-confirm v-if="showOverlay" :tipText="$t('sure')+$t('del')+$t('ma')"
                     @confirm="showOverlay.res" @close="showOverlay.rej"
                     @cancel="showOverlay.rej"/>
  </page-container>
</template>

<script>
import MyInput from 'components/client/MyInput'
import MyFileInput from 'components/form/MyFileInput'
import Status from 'data/immutable-data/Status'
import AliOss from 'utils/AliOss'
import { dataDeal } from 'utils/DataDeal'
import { validateVerifyCode } from 'utils/FormValidate'
import { verifyCodeNumber } from 'utils/InputFormatter'
import { strTrimAll } from 'utils/Utils'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'CashPaySet',
  components: { MyFileInput, MyInput },
  data() {
    return {
      tab: {
        value: '',
        options: [
          { name: 'pay.set', value: '' },
        ],
      },
      items: null,
      verifyItems: null,
      add: false,
      showOverlay: null,
      types: {
        name: 'type',
        alias: 'status',
        value: '',
        inputType: 'select',
        options: [],
      },
    }
  },
  computed: {
    ...mapState('user', ['info', 'bankCards', 'security', 'myPayTypes']),
    ...mapGetters(['siteInfo']),
    title() {
      return this.$t('pay.set')
    },
    options() {
      return (this.siteInfo.otcEnabled ? [0, 1, 2] : [0]).map(k => ({
        ...Status.otcPayType[k],
        value: k,
        needTran: true,
      }))
    },
    banks() {
      return this.myPayTypes.filter(p => +p.type === 0)
    },
    others() {
      return this.myPayTypes.filter(p => +p.type !== 0)
    },
    showPayTypes() {
      return this.siteInfo.otcEnabled ? this.myPayTypes : this.banks
    },
    showItems() {
      return this.items ? this.items[this.types.value] : []
    },
    showVerifyItems() {
      return this.verifyItems && [
        ...this.verifyItems.filter(item => Object.keys(this.security).every((key) => {
          const include = item.name.includes(key)
          return !include || (include && this.security[key])
        })),
      ]
    },
    tip() {
      const { otcEnabled, c2cEnabled } = this.siteInfo
      return this.$t(`pay-type.set.tip${otcEnabled && c2cEnabled ? '' : '.c2c'}`)
    },
  },
  watch: {
    'options': {
      handler(val) {
        this.types.options = val
        if (val.length > 0) this.types.value = val[0].value
      },
      immediate: true,
    },
    'myPayTypes': {
      handler(val) {
        if (val && val.length < 1) {
          this.itemsInit()
        }
      },
      immediate: true,
    },
    add(val) {
      if (val) {
        this.itemsInit()
      }
    },
    banks(val) {
      if (!val.length) {
        this.itemsInit()
      }
    },
    'info.id': {
      handler(val) {
        if (val) this.getOssConfig()
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('user', [
      'getCard',
      'setCard',
      'delCard',
      'getSecurity',
      'getOssConfig',
      'getCodeAfterLogin',
      'getUserInfo',
      'getMyPayTypes',
      'addMobilePay',
      'delMobilePay',
    ]),
    getCode(type = 1) {
      return this.getCodeAfterLogin({ use_type: 12, type }).then(() => {
        this.snackBar.info(this.$t('verify.code.get.success'))
      })
    },
    uploadQrcode(item, [file]) {
      item.uploading = true
      AliOss
        .ossUpload(file)
        .then((res) => {
          item.uploading = false
          item.value = res.name
          item.url = file
        })
        .catch(this.snackBar.error)
    },
    submit() {
      const items = [this.types, ...this.showItems, ...this.showVerifyItems]
      return this.validate(items)
        .then(() => (+this.types.value === 0 ? this.setCard : this.addMobilePay)(dataDeal(items)))
        .then(() => {
          this.snackBar.info(this.$t('bound'))
          this.add = false
          // this.getCard()
          this.getMyPayTypes()
        })
    },
    itemsInit() {
      this.items = {
        0: [
          {
            name: 'bank',
            alias: 'bank_name',
            value: '',
            preFormatter: strTrimAll,
          },
          {
            name: 'bank.branch',
            alias: 'sub_bank_name',
            value: '',
            preFormatter: strTrimAll,
          },
          {
            name: 'bank.card.num',
            alias: 'number',
            value: '',
            preFormatter: strTrimAll,
          },
          // { name: 'bank.card.num.confirm', alias: 'card_number_confirm', value: '' },
          // {
          //   name: 'bank.card.phone',
          //   alias: 'pre_phone',
          //   value: '',
          //   preFormatter: strTrimAll,
          // },
        ],
        1: [
          {
            name: 'alipay.account',
            alias: 'account',
            value: '',
            preFormatter: strTrimAll,
          },
          {
            name: 'alipay.nickname',
            alias: 'name',
            value: '',
            preFormatter: strTrimAll,
          },
          {
            name: 'pay.qrcode',
            alias: 'filename',
            value: '',
            url: '',
            inputType: 'file',
            uploading: false,
          },
        ],
        2: [
          {
            name: 'wechat.account',
            alias: 'account',
            value: '',
            preFormatter: strTrimAll,
          },
          {
            name: 'wechat.nickname',
            alias: 'name',
            value: '',
            preFormatter: strTrimAll,
          },
          {
            name: 'pay.qrcode',
            alias: 'filename',
            value: '',
            url: '',
            inputType: 'file',
            uploading: false,
          },
        ],
      }

      this.verifyItems = [
        {
          name: 'verify.code.phone',
          alias: 'sms_code',
          value: '',
          placeholder: 'verify.code.phone',
          preFormatter: verifyCodeNumber,
          validator: validateVerifyCode,
          errorText: '',
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode(0),
        },
        {
          name: 'verify.code.email',
          alias: 'email_code',
          value: '',
          placeholder: 'verify.code.email',
          preFormatter: verifyCodeNumber,
          validator: validateVerifyCode,
          errorText: '',
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode(),
        },
        {
          name: 'verify.code.google',
          alias: 'two_step_code',
          value: '',
          placeholder: 'verify.code.google',
          preFormatter: verifyCodeNumber,
          errorText: '',
        },
      ]
    },
    del({ ID: id, status: type = 0 }) {
      new Promise((res, rej) => {
        this.showOverlay = {
          res,
          rej,
        }
      }).then(() => {
        (+type === 0 ? this.delCard : this.delMobilePay)(id).then(() => {
          this.snackBar.info(this.$t('del.success'))
          this.showOverlay = null
          this.getMyPayTypes()
          this.getUserInfo()
        }).catch(this.snackBar.error)
      }).catch((err) => {
        if (err) this.snackBar.error(err)
        else this.showOverlay = null
      })
    },
  },
  beforeMount() {
    // if (this.info.bank_card_bound) this.getCard()
    // else this.itemsInit()
    this.getMyPayTypes()
    this.getSecurity()
  },
}
</script>
