<template>
  <page-container class="password-reset" :title="$t('password.reset')">
    <section class="wrap">
      <div class="top">
        <h1 class="h1">
          <template v-if="step===1">
            {{$t('password.reset')}} -
            <template v-for="(r, i) in types">
              <router-link v-if="type!==r.value" class="tab" :class="{selected: type===r.value}"
                           :to="$route.path+'?type='+r.value" :key="i">{{r.name}}
              </router-link>
              <template v-else>
                {{r.name}}
              </template>
            </template>
          </template>
          <template v-else>
            <span class="iconfont icon-right left font-main" @click="to(1)()">{{$t('pre')}}</span>
          </template>
        </h1>
        <my-input v-for="(item,i) in showItems" v-model="item.value"
                  :key="i" :item="item" theme="white" @imgClick="getImgCode"
                  @errorGet="getImgCode"/>
      </div>
      <div class="bottom">
        <template v-if="step===1">
          <btn-once class="btn-green-fill submit" :clickFn="to(2)" :useLoading="true">
            {{$t('next')}}
          </btn-once>
        </template>
        <template v-else>
          <btn-once class="btn-green-fill submit" :clickFn="submit" :useLoading="true">
            {{$t('sure')}}
          </btn-once>
        </template>
        <span class="tip">{{$t('account.none')}}?
          <router-link to="/sign-up">{{$t('sign-up.immediately')}}</router-link>
        </span>
      </div>
    </section>
  </page-container>
</template>

<script>
import MyInput from 'components/client/MyInput'
import { dataDeal } from 'utils/DataDeal'
import { validateEmail, validatePassword, validateVerifyCode } from 'utils/FormValidate'
import { emailPreFormatter, phonePreFormatter, verifyCodeNumber } from 'utils/InputFormatter'
import { strTrimAll } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'PasswordReset',
  beforeMount() {
    this.getImgCode()
    this.getCountries().catch(this.snackBar.error)
  },
  data() {
    return {
      phone: [
        { name: 'phone.belongs', alias: 'country_id', value: 44, inputType: 'select', options: [] },
        {
          name: 'phone',
          alias: 'username',
          value: '',
          preFormatter: phonePreFormatter,
          prefix: '+86',
          placeholder: 'phone',
          inputStyle: { textIndent: '.4rem' },
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
      verifyItems: [
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
      ],
      items: [
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
      ],
      imgCode: {
        name: 'verify.code.img',
        alias: 'img_code',
        value: '',
        placeholder: 'verify.code.img',
        preFormatter: verifyCodeNumber,
        validator: validateVerifyCode,
        imgCode: '',
        imgId: '',
      },
      step: 1,
    }
  },
  computed: {
    ...mapState('user', ['countries']),
    type() {
      return this.$route.query.type || 'phone'
    },
    types() {
      const items = [
        { name: this.$t('phone-1'), value: 'phone' },
        { name: this.$t('email'), value: 'email' },
      ]
      return this.type === 'email' ? [...items].reverse() : items
    },
    showVerifyItems() {
      return this.verifyItems
    },
    showItems() {
      return this.step === 1 ? [...this[this.type], this.imgCode]
        : [...this.showVerifyItems, ...this.items]
    },
    countryOptions() {
      return this.countries && this.countries.map(item => ({
        ...item,
        name: this.$i18n.locale.includes('zh-hans') ? item.name_cn : item.name_en,
        value: item.ID,
      }))
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
  },
  methods: {
    ...mapActions('user', ['getCountries', 'getCode', 'getCodeImg', 'resetPassword']),
    getImgCode() {
      return this.getCodeImg()
        .then((res) => {
          this.imgCode.imgCode = res.url
          this.imgCode.imgId = res.id
        }).catch(this.snackBar.error)
    },
    getSms() {
      const items = this.showItems.slice(0, this.type === 'phone' ? 3 : 2)
      return this.validate(items)
        .then(() => this.getCode({
          ...dataDeal(items),
          use_type: 2,
          id: this.imgCode.imgId,
        }).then(() => {
          this.snackBar.info(this.$t('verify.code.get.success'))
        }))
    },
    submit() {
      return this.validate(this.showItems)
        .then(() => this.pwdConfirmValidate(this.items[0], this.items[1]))
        .then(() => this.resetPassword(dataDeal(this.showItems))
          .then(() => {
            this.snackBar.info(this.$t('password.reset.success'))
            this.$router.push('/sign-in')
          }))
    },
    to(step) {
      return () => new Promise((res) => {
        this.step = step
        res()
      })
    },
  },
  components: { MyInput },
}
</script>
