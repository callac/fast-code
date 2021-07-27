<template>
  <page-container class="user-content reset-password" :title="title">
    <tab-head v-model="tab.value" :options="tab.options"/>
    <div class="form">
      <my-input v-for="(item,i) in items" type="1" class="item" :key="i" v-model="item.value"
                :item="item" @btnClick="getCode(item.alias)"/>
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
import { validatePassword } from 'utils/FormValidate'
import { strTrimAll } from 'utils/Utils'
import { mapActions } from 'vuex'

export default {
  name: 'ResetPassword',
  data() {
    return {
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
  components: { TabHead, MyInput },
}
</script>
