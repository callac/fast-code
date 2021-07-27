<template>
  <page-container class="password-reset" :title="$t('password.reset')">
    <h1 class="content page-head">{{$t('password.reset')}}</h1>
    <section class="content wrap">
      <div class="top">
        <h2 class="h1">
          <template v-for="(r, i) in types">
            <router-link
              class="tab"
              :class="{selected: type===r.value}"
              :to="$route.path+'?type='+r.value"
              :key="i"
            >{{$t('password.reset')}} - {{r.name}}
            </router-link>
          </template>
        </h2>
        <my-input
          v-for="(item,i) in showItems"
          v-model="item.value"
          type="1"
          :key="i"
          :item="item"
          @imgClick="getImgCode"
          @errorGet="getImgCode"
        />
      </div>
      <div class="bottom">
        <btn-once class="btn-main-fill submit" :clickFn="submit" :useLoading="true">
          {{$t('submit')}}
        </btn-once>
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
          prefix: '+86',
          preFormatter: phonePreFormatter,
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
      items: [
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
      ],
      imgCode: null,
    }
  },
  computed: {
    ...mapState('user', ['countries']),
    type() {
      return this.$route.query.type || 'phone'
    },
    types() {
      return [
        { name: this.$t('phone-1'), value: 'phone' },
        { name: this.$t('email'), value: 'email' },
      ]
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
  },
  methods: {
    ...mapActions('user', ['getCountries', 'getCode', 'getCodeImg', 'resetPassword']),
    getImgCode() {
      return this.getCodeImg()
        .then((res) => {
          this.imgCode = res
        }).catch(this.snackBar.error)
    },
    getSms() {
      const items = this.showItems.slice(0, this.type === 'phone' ? 3 : 2)
      return this.validate(items)
        .then(() => this.getCode({
          ...dataDeal(items),
          use_type: 2,
          id: this.imgCode.id,
        }).then(() => {
          this.snackBar.info(this.$t('verify.code.get.success'))
        }))
    },
    submit() {
      return this.validate(this.showItems)
        .then(() => this.resetPassword(dataDeal(this.showItems))
          .then(() => {
            this.snackBar.info(this.$t('password.reset.success'))
            this.$router.push('/sign-in')
          }))
    },
  },
  components: { MyInput },
}
</script>
