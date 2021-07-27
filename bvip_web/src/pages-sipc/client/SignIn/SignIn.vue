<template>
  <page-container class="sign-in" :title="$t('sign-in')">
    <h1 class="content page-head">{{$t('sign-in')}}</h1>
    <section class="content wrap">
      <div class="top">
        <my-input
          v-for="(item,i) in items"
          v-model="item.value"
          type="1"
          :key="i"
          :item="item"
          @keyUpEnter="submit().catch(snackBar.error)"
        />
        <router-link class="forget-p"
                     to="/password/reset">{{$t('password.forget')}}?
        </router-link>
      </div>
      <div class="bottom">
        <btn-once class="btn-main-fill submit"
                  :clickFn="submit"
                  :useLoading="true">
          {{$t('sign-in.immediately')}}
        </btn-once>
        <span class="tip">{{$t('account.none')}}?
          <router-link :to="'/sign-up?redirectTo='+($route.query.redirectTo || '/')">
            {{$t('sign-up.immediately')}}</router-link>
        </span>
      </div>
    </section>
    <overlay v-if="showOverlay"
             @click="showOverlay.rej()">
      <div class="verify-items">
        <h2 class="h2">{{$t('verify.security')}}
          <!--<span class="iconfont icon-del" @click="showOverlay.rej()"></span>--></h2>
        <my-input
          v-for="(item,i) in verifyItems"
          v-model="item.value"
          type="1"
          :key="i"
          :item="item"
          @keyUpEnter="showOverlay.res"
        />
        <div class="btns">
          <btn-once
            class="btn-main-fill submit"
            :clickFn="showOverlay.res"
            :useLoading="true"
          >
            {{$t('sign-in')}}
          </btn-once>
          <button class="btn-cancel" @click="showOverlay.rej">{{$t('cancel-1')}}</button>
        </div>
      </div>
    </overlay>
  </page-container>
</template>

<script>
import MyInput from 'components/client/MyInput'
import { dataDeal } from 'utils/DataDeal'
import { validateEmail, validatePassword, validateVerifyCode } from 'utils/FormValidate'
import { verifyCodeNumber } from 'utils/InputFormatter'
import { strTrimAll } from 'utils/Utils'
import { mapActions } from 'vuex'

export default {
  name: 'SignIn',
  data() {
    return {
      items: [
        {
          name: 'phone&email',
          alias: 'username',
          value: '',
          preFormatter: strTrimAll,
          placeholder: 'phone&email',
          validator: val => (/^[\d\-+\s]+$/.test(val) || validateEmail(val)),
          errorText: 'validate.email&phone.error',
          autocomplete: 'on',
        },
        {
          name: 'password',
          alias: 'password',
          inputType: 'password',
          value: '',
          preFormatter: strTrimAll,
          placeholder: 'password.tip',
          validator: validatePassword,
          errorText: 'validate.pwd.error',
          autocomplete: 'on',
        },
      ],
      securities: null,
      showOverlay: null,
      verifyItems: [],
    }
  },
  computed: {},
  watch: {
    securities: {
      handler() {
        this.verifyItems = this.getVerifyItems()
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('user', ['signIn', 'safeLogin', 'getCodeAfterLogin']),
    getCode(alias) {
      const type = alias === 'sms_code' ? '0' : '1'
      return this.getCodeAfterLogin({
        type,
        use_type: 1,
      }).then(() => {
        this.snackBar.info(this.$t('verify.code.get.success'))
      })
    },
    getVerifyItems() {
      if (!this.securities) return []
      const items = [
        {
          name: 'verify.code.phone',
          aliasName: 'phone',
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
          name: 'verify.code.email',
          aliasName: 'email',
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
          aliasName: 'google',
          alias: 'two_step_code',
          value: '',
          preFormatter: strTrimAll,
          placeholder: '',
          errorText: '',
        },
      ]
      return items.filter(item => this.securities[item.aliasName])
    },
    submit() {
      return this.validate(this.items)
        .then(() => this.signIn(dataDeal(this.items))
          .then((res) => {
            if (+res.need_safe === 0) return Promise.resolve().then(this.callback)
            this.securities = res.securities
            return new Promise((resolve, rej) => {
              this.showOverlay = {
                res: () => this.login().then(resolve).catch(this.snackBar.error),
                rej,
              }
            }).catch(() => {
              this.showOverlay = null
            })
          }))
    },
    login() {
      return this.validate(this.verifyItems)
        .then(() => this.safeLogin(dataDeal(this.verifyItems)).then(this.callback))
    },
    callback() {
      this.snackBar.info(this.$t('sign-in.success'))
      const url = this.$route.query.redirectTo || '/'
      const { origin } = window.location
      if (/^https?:\/\//.test(url) && url.startsWith(origin)) {
        window.location.href = url
      } else {
        this.$router.push(url)
      }
    },
  },
  components: { MyInput },
}
</script>
