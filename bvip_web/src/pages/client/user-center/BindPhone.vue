<template>
  <page-container class="user-content bind-phone" :title="title">
    <tab-head v-model="tab.value" :options="tab.options"/>
    <div class="form">
      <my-input v-for="(item,i) in showItems" type="1" class="item" :key="i" v-model="item.value"
                :item="item"/>
      <btn-once class="submit btn-green-fill" :clickFn="submit" :useLoading="true">
        {{$t('submit')}}
      </btn-once>
    </div>
  </page-container>
</template>

<script>
import MyInput from 'components/client/MyInput'
import TabHead from 'components/client/user-center/TabHead'
import { dataDeal } from 'utils/DataDeal'
import { validateVerifyCode } from 'utils/FormValidate'
import { phonePreFormatter, verifyCodeNumber } from 'utils/InputFormatter'
import { strTrimAll } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'BindPhone',
  beforeMount() {
    this.getSecurity().catch(this.snackBar.error)
    this.getCountries().catch(this.snackBar.error)
    this.setVal(this.user)
  },
  data() {
    return {
      items: [
        {
          name: 'phone.belongs',
          alias: 'country_id',
          value: 44,
          inputType: 'select',
          options: [],
          inputStyle: { maxHeight: '40vh' },
        },
        {
          name: 'phone',
          alias: 'phone',
          value: '',
          prefix: '+86',
          preFormatter: phonePreFormatter,
          placeholder: 'phone',
          errorText: '',
          inputStyle: { textIndent: '.4rem' },
        },
        {
          name: 'verify.code.phone',
          alias: 'sms_code',
          value: '',
          placeholder: 'verify.code.phone',
          preFormatter: verifyCodeNumber,
          validator: validateVerifyCode,
          errorText: '',
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode('sms_code'),
        },
        {
          name: 'email',
          alias: 'email',
          value: '',
          placeholder: '',
          errorText: '',
          canEdit: false,
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
          btnCodeFn: () => this.getCode('email_code'),
        },
        {
          name: 'verify.code.google',
          alias: 'two_step_code',
          value: '',
          preFormatter: strTrimAll,
          placeholder: '',
          errorText: '',
        },
      ],
    }
  },
  computed: {
    ...mapState('user', {
      security: 'security',
      user: state => state.info,
      countries: 'countries',
    }),
    countryOptions() {
      return this.countries && this.countries.map(item => ({
        ...item,
        name: this.$i18n.locale.includes('zh-hans') ? item.name_cn : item.name_en,
        value: item.ID,
      }))
    },
    title() {
      return this.$t('bind') + this.$t('phone')
    },
    tab() {
      return {
        value: '',
        options: [
          { name: this.title, value: '', needTran: false },
        ],
      }
    },
    showItems() {
      return this.security.google ? this.items : this.items.slice(0, this.items.length - 1)
    },
  },
  watch: {
    user(val) {
      this.setVal(val)
    },
    countryOptions(val) {
      this.$set(this.items[0], 'options', val)
    },
    'items.0.value'(val) {
      if (this.countries) {
        const co = this.countries.find(c => c.ID === val)
        this.$set(this.items[1], 'prefix', co.area_code)
      }
    },
  },
  methods: {
    ...mapActions('user', ['getSecurity', 'getUserInfo', 'bindPhone', 'getCountries', 'getCodeAfterLogin']),
    getCode(alias) {
      const type = alias === 'sms_code' ? '0' : '1'
      const phone = alias === 'sms_code' ? this.items[1].value : ''
      const country_id = alias === 'sms_code' ? this.items[0].value : ''
      return alias !== 'sms_code' || phone ? this.getCodeAfterLogin({
        type,
        use_type: 4,
        phone,
        country_id,
      }).then(() => {
        this.snackBar.info(this.$t('verify.code.get.success'))
      }) : Promise.reject(new Error(this.$t('please-set') + this.$t('phone')))
    },
    setVal(val) {
      this.items = this.items.map(item => (item.alias !== 'country_id' ? {
        ...item,
        value: val[item.alias],
      } : item))
    },
    submit() {
      return this.validate(this.showItems)
        .then(() => this.bindPhone(dataDeal(this.showItems)).then(() => {
          this.snackBar.info(this.$t('bound'))
          this.$router.push('/user-center/security')
        }))
    },
  },
  components: { TabHead, MyInput },
}
</script>
