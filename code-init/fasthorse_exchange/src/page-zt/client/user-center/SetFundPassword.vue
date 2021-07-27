<template>
  <page-container class="user-content set-fund-password" :title="title">
    <nav-head :nav="nav"></nav-head>
    <!--<tab-head v-model="tab.value" :options="tab.options"/>-->
    <div class="form-wrap">
      <div class="form">
        <p class="box-title">{{$t('security.passwords.fund')}}</p>
        <my-input v-for="(item,i) in showItems" type="1" class="item" :key="i" v-model="item.value"
                  :item="item" @btnClick="getCode(item.alias)"/>
        <btn-once class="submit btn-blue" :clickFn="submit" :useLoading="true">
          {{$t('submit')}}
        </btn-once>
      </div>
      <div class="form-tip">*{{$t('password.fund.unset.update-tip')}}</div>
    </div>
  </page-container>
</template>

<script>
import MyInput from 'components/client/MyInput'
import NavHead from '@/page-zt/components/user-center/NavHead'
import { dataDeal } from 'utils/DataDeal'
import { validatePassword } from 'utils/FormValidate'
import { verifyCodeNumber } from 'utils/InputFormatter'
import { strTrimAll } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'SetFundPassword',
  beforeMount() {
    this.getSecurity().catch(this.snackBar.error)
  },
  data() {
    return {
      nav: {
        value: 1,
        options: [
          { name: this.$t('user.security'), url: '/user-center/security' },
          { name: this.$t('security.set.fund'), url: '' },
        ],
      },
      items: [
        {
          name: 'password.new',
          alias: 'password',
          inputType: 'password',
          value: '',
          preFormatter: strTrimAll,
          validator: validatePassword,
          placeholder: 'password.tip.fund',
          errorText: '',
        },
        {
          name: 'password.confirm',
          alias: 'password_confirmation',
          inputType: 'password',
          value: '',
          preFormatter: strTrimAll,
          validator: validatePassword,
          placeholder: 'password.tip.fund',
          errorText: '',
        },
        {
          name: 'phone',
          alias: 'phone',
          value: '',
          placeholder: '',
          errorText: '',
          canEdit: false,
        },
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
          placeholder: '',
          preFormatter: strTrimAll,
          errorText: '',
        },
      ],
    }
  },
  computed: {
    ...mapState('user', {
      security: 'security',
      user: state => state.info,
    }),
    items1() {
      return this.items.map((item) => {
        item.value = this.user[item.alias]
        return item
      })
    },
    isReset() {
      return this.user.withdraw_password_set
    },
    title() {
      return (this.isReset ? this.$t('reset') : this.$t('set'))
        + this.$t('password.fund')
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
      return this.items1
        .filter(item => Object.keys(this.security).every((key) => {
          const include = item.name.includes(key)
          return !include || (include && this.security[key])
        }))
    },
  },
  methods: {
    ...mapActions('user', ['getSecurity', 'getUserInfo', 'setFundPassword', 'resetFundPassword', 'getCodeAfterLogin']),
    getCode(alias) {
      const type = alias === 'email_code' ? '1' : '0'
      return this.getCodeAfterLogin({ type, use_type: this.isReset ? 11 : 6 }).then(() => {
        this.snackBar.info(this.$t('verify.code.get.success'))
      })
    },
    submit() {
      const msg = this.$t(this.isReset ? 'beenReset' : 'beenSet')
      return this.validate(this.showItems)
        .then(() => this.pwdConfirmValidate(this.items[0], this.items[1]))
        .then(() => (this.isReset ? this.resetFundPassword(dataDeal(this.showItems))
          : this.setFundPassword(dataDeal(this.showItems))).then(() => {
          this.snackBar.info(msg)
          this.$router.push('/user-center/security')
        }))
    },
  },
  components: { MyInput, NavHead },
}
</script>
