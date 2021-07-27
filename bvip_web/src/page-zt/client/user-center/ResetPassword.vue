<template>
  <page-container class="user-content reset-password" :title="title">
    <nav-head :nav="nav"></nav-head>
    <!--<tab-head v-model="tab.value" :options="tab.options"/>-->
    <div class="form">
      <p class="box-title">{{$t('security.passwords.reset')}}</p>
      <my-input v-for="(item,i) in items" type="1" class="item" :key="i" v-model="item.value"
                :item="item" @btnClick="getCode(item.alias)"/>
      <btn-once class="submit btn-blue" :clickFn="submit" :useLoading="true">
        {{$t('submit')}}
      </btn-once>
    </div>
  </page-container>
</template>

<script>
import MyInput from 'components/client/MyInput'
import NavHead from '@/page-zt/components/user-center/NavHead'
import { dataDeal } from 'utils/DataDeal'
import { validatePassword } from 'utils/FormValidate'
import { strTrimAll } from 'utils/Utils'
import { mapActions } from 'vuex'

export default {
  name: 'ResetPassword',
  data() {
    return {
      nav: {
        value: 1,
        options: [
          { name: this.$t('user.security'), url: '/user-center/security' },
          { name: this.$t('security.passwords.reset'), url: '' },
        ],
      },
      items: [
        {
          name: 'password.old',
          alias: 'origin_password',
          inputType: 'password',
          value: '',
          preFormatter: strTrimAll,
          validator: validatePassword,
          placeholder: 'password.tip',
          errorText: '',
        },
        {
          name: 'password.new',
          alias: 'password',
          inputType: 'password',
          value: '',
          preFormatter: strTrimAll,
          validator: validatePassword,
          placeholder: 'password.tip',
          errorText: '',
        },
        {
          name: 'password.confirm',
          alias: 'password_confirmation',
          inputType: 'password',
          value: '',
          preFormatter: strTrimAll,
          validator: validatePassword,
          placeholder: 'password.tip',
          errorText: '',
        },
      ],
    }
  },
  computed: {
    title() {
      return this.$t('reset') + this.$t('password')
    },
    tab() {
      return {
        value: '',
        options: [
          { name: this.title, value: '', needTran: false },
        ],
      }
    },
  },
  methods: {
    ...mapActions('user', ['resetPasswordAfterLogin']),
    submit() {
      return this.validate(this.items)
        .then(() => this.pwdConfirmValidate(this.items[2], this.items[1]))
        .then(() => this.resetPasswordAfterLogin(dataDeal(this.items)).then(() => {
          this.snackBar.info(this.$t('password.reset.success'))
          this.$router.back()
        }))
    },
  },
  components: { NavHead, MyInput },
}
</script>
