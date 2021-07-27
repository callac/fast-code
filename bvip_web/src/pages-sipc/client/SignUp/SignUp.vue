<template>
  <page-container class="sign-up" :title="$t('sign-up')">
    <h1 class="content page-head">{{$t('sign-up')}}</h1>
    <section class="content wrap">
      <div class="top">
        <h2 class="h1">
          <template v-for="(r, i) in types">
            <router-link class="tab" :class="{selected: type===r.value}"
                         :to="$route.path+'?type=' + r.value
                          + (recommend_code?'&recommend_code=' + recommend_code:'')"
                         :key="i">{{r.name}}
            </router-link>
          </template>
        </h2>
        <my-input
          v-for="item in showItems"
          v-model="item.value"
          :key="item.name+type"
          :item="item"
          type="1"
          @imgClick="getImgCode"
          @errorGet="getImgCode"
        />
        <div class="user-agreement">
          <check-box v-model="userAgreement.value" :name="$t(userAgreement.agree)"
                     checkboxSize=".26rem"
                     :icons="{default: 'icon-checkbox-sipc',
                            checked: 'icon-checkbox-checked-sipc'}"/>
          <span class="a font-green" @click="showOverlay=true">{{$t('view')}}</span>
        </div>
      </div>
      <div class="bottom">
        <btn-once class="btn-main-fill submit" :clickFn="submit" :useLoading="true">
          {{$t('sign-up.immediately')}}
        </btn-once>
        <span class="tip">{{$t('account.exist')}}?
          <router-link :to="'/sign-in?redirectTo='+($route.query.redirectTo || '/')">
            {{$t('sign-in.immediately')}}</router-link>
        </span>
      </div>
    </section>
    <overlay v-if="showOverlay" @click="showOverlay=false">
      <div class="window">
        <agreement class="agreement" :showDel="true" @close="showOverlay=false"/>
      </div>
    </overlay>
  </page-container>
</template>

<script>
import Agreement from 'components/client/Agreement'
import MyInput from 'components/client/MyInput'
import { dataDeal } from 'utils/DataDeal'
import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateVerifyCode,
} from 'utils/FormValidate'
import { emailPreFormatter, phonePreFormatter, verifyCodeNumber } from 'utils/InputFormatter'
import { getSignUpConfig } from 'utils/SignUp'
import { strTrimAll } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'SignUp',
  components: { MyInput, Agreement },
  data() {
    return {
      showOverlay: '',
      userAgreement: {
        value: '',
        name: 'sign-up.agreement',
        agree: 'sign-up.agreement.agree',
      },
      phone: [
        { name: 'phone.belongs', alias: 'country_id', value: 44, inputType: 'select', options: [] },
        {
          name: 'phone',
          alias: 'username',
          value: '',
          prefix: '+86',
          preFormatter: phonePreFormatter,
          placeholder: 'phone',
          inputStyle: { textIndent: '.4rem' },
          validator: val => this.phone[0].value !== 44 || validatePhoneNumber(val),
        },
      ],
      email: [
        {
          name: 'email',
          alias: 'username',
          value: '',
          preFormatter: emailPreFormatter,
          placeholder: 'email',
          validator: validateEmail,
        },
      ],
      items: this.itemsFn(),
      imgCode: null,
    }
  },
  computed: {
    ...mapState(['siteInfo']),
    ...mapState('user', ['countries']),
    config() {
      return getSignUpConfig(this.siteInfo.default_register_method)
    },
    type() {
      return this.$route.query.type || this.config.defaultType
    },
    types() {
      return this.config.types.map(s => ({
        ...s,
        name: s.name((...args) => this.$t(...args)),
      }))
    },
    showItems() {
      return [...this[this.type], ...this.items]
    },
    countryOptions() {
      return this.countries && this.countries.map(item => ({
        ...item,
        name: this.$i18n.locale.includes('zh-hans') ? item.name_cn : item.name_en,
        value: item.ID,
      }))
    },
    recommend_code() {
      return this.$route.query.recommend_code || ''
    },
  },
  watch: {
    countryOptions(val) {
      this.$set(this.phone, 0, { ...this.phone[0], options: val })
    },
    'phone.0.value'(val) {
      const co = this.countries.find(c => c.ID === val)
      this.$set(this.phone[1], 'prefix', co.area_code)
    },
    imgCode(val) {
      if (val) this.$set(this.items, 0, { ...this.items[0], imgCode: val.url })
    },
    '$route'() {
      this.items = this.itemsFn()
      this.getImgCode()
    },
  },
  methods: {
    ...mapActions('user', ['getCountries', 'getCode', 'register', 'getCodeImg']),
    getImgCode() {
      return this.getCodeImg()
        .then((res) => {
          this.imgCode = res
        }).catch(this.snackBar.error)
    },
    submit() {
      return (this.userAgreement.value ? Promise.resolve()
        : Promise.reject(this.$t('sign-up.agreement.tip')))
        .then(() => this.validate(this.showItems))
        .then(() => this.register({
          ...dataDeal(this.showItems),
        }).catch((e) => {
          this.getImgCode()
          throw e
        }))
        .then(() => {
          this.snackBar.info(this.$t('sign-up.success'))
          const url = this.$route.query.redirectTo || '/'
          const { origin } = window.location
          if (/^https?:\/\//.test(url) && url.startsWith(origin)) {
            window.location.href = url
          } else {
            this.$router.push(url)
          }
        })
    },
    getSms() {
      const items = this.showItems.slice(0, this.type === 'phone' ? 3 : 2)
      return this.validate(items)
        .then(() => this.getCode({
          ...dataDeal(items),
          use_type: 0,
          id: this.imgCode.id,
        }).then(() => {
          this.snackBar.info(this.$t('verify.code.get.success'))
        }))
    },
    itemsFn() {
      const recommend_code = this.$route.query.recommend_code || ''
      const { recommend_code_force } = this.$store.state.siteInfo
      return [
        {
          name: 'verify.code.img',
          alias: 'img_code',
          value: '',
          placeholder: 'verify.code.img',
          preFormatter: verifyCodeNumber,
          validator: validateVerifyCode,
          imgCode: '',
        },
        {
          name: 'verify.code',
          alias: 'code',
          value: '',
          placeholder: 'verify.code',
          preFormatter: verifyCodeNumber,
          validator: validateVerifyCode,
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getSms(),
        },
        {
          name: 'password',
          inputType: 'password',
          alias: 'password',
          value: '',
          preFormatter: strTrimAll,
          validator: validatePassword,
          placeholder: 'password.tip',
        },
        {
          name: 'password.confirm',
          alias: 'password_confirmation',
          inputType: 'password',
          value: '',
          preFormatter: strTrimAll,
          validator: validatePassword,
          placeholder: 'password.tip',
        },
        {
          name: 'recommend.code',
          alias: 'recommend_code',
          value: recommend_code,
          preFormatter: strTrimAll,
          placeholder: 'recommend.code.tip',
          required: !!recommend_code_force,
          canEdit: !recommend_code,
        },
      ]
    },
  },
  beforeRouteEnter(to, fr, next) {
    if (window.isMobile) {
      window.location.href = `/mobile${window.location.search}`
    } else {
      next()
    }
  },
  beforeMount() {
    this.getImgCode()
    this.getCountries().catch(this.snackBar.error)
  },
}
</script>
