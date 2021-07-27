<template>
  <my-overlay
    v-if="show"
    class="bind-email"
    :head="title"
    @close="hide"
  >
    <div class="form">
      <my-input v-for="(item,i) in showItems" type="1" class="item" :key="i" v-model="item.value"
                :item="item" @btnClick="getCode(item.alias)"/>
      <btn-once class="submit btn-green-fill" :clickFn="submit" :useLoading="true">
        {{$t('submit')}}
      </btn-once>
    </div>
  </my-overlay>
</template>

<script>
import MyInput from 'components/client/MyInput'
import MyOverlay from 'components/client/MyOverlay'
import { dataDeal } from 'utils/DataDeal'
import { validateEmail, validateVerifyCode } from 'utils/FormValidate'
import { emailPreFormatter, verifyCodeNumber } from 'utils/InputFormatter'
import { strTrimAll } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'BindEmail',
  components: { MyOverlay, MyInput },
  data() {
    return {
      show: false,
      items: [
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
          validator: validateVerifyCode,
          errorText: '',
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode('sms_code'),
        },
        {
          name: 'email',
          alias: 'email',
          value: '',
          preFormatter: emailPreFormatter,
          placeholder: '',
          errorText: '',
          validator: validateEmail,
        },
        {
          name: 'verify.code.email',
          alias: 'email_code',
          value: '',
          placeholder: '',
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
    }),
    items1() {
      return this.items.map((item) => {
        item.value = this.user[item.alias] || ''
        return item
      })
    },
    title() {
      return this.$t('bind') + this.$t('email')
    },
    showItems() {
      return this.security.google ? this.items1 : this.items1.slice(0, this.items1.length - 1)
    },
  },
  methods: {
    ...mapActions('user', ['getSecurity', 'getUserInfo', 'bindEmail', 'getCodeAfterLogin']),
    getCode(alias) {
      const type = alias === 'sms_code' ? '0' : '1'
      const email = alias === 'sms_code' ? '' : this.items[2].value
      return alias === 'sms_code' || email ? this.getCodeAfterLogin({
        type,
        use_type: 5,
        email,
      }).then(() => {
        this.snackBar.info(this.$t('verify.code.get.success'))
      }) : Promise.reject(new Error(this.$t('please-set') + this.$t('email')))
    },
    submit() {
      return this.validate(this.showItems)
        .then(() => this.bindEmail(dataDeal(this.showItems)).then(() => {
          this.snackBar.info(this.$t('bound'))
          this.$router.push('/user-center/security')
        }))
    },
    open() {
      this.show = true
    },
    hide() {
      this.show = false
    },
  },
  beforeMount() {
    this.getSecurity().catch(this.snackBar.error)
  },
}
</script>
