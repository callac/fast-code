<template>
  <page-container class="mobile-sign-in"
                  :title="$t('sign-in')">
    <header class="header">{{$t('sign-in')}}</header>
    <section class="wrap">
      <div class="forms">
        <mobile-input v-for="(item,i) in items"
                      v-model="item.value"
                      :key="i" :item="item"
                      theme="white"
                      @keyUpEnter="submit().catch(snackBar.error)"/>
      </div>
      <div class="bottom">
        <btn-once class="btn-green-fill submit"
                  :clickFn="submit" :useLoading="true">
          {{$t('sign-in.immediately')}}
        </btn-once>
      </div>
      <footer class="footer">{{$t('account.none')}}?
        <router-link class="font-green"
                     :to="'/mobile?redirectTo='+($route.query.redirectTo || '/')">
          {{$t('sign-up.immediately')}}
        </router-link>
      </footer>
      <overlay v-if="showOverlay"
               @click="showOverlay.rej()">
        <div class="verify-items">
          <h2 class="verify-items-h">{{$t('verify.security')}}
            <!--<span class="iconfont icon-del" @click="showOverlay.rej()"></span>--></h2>
          <mobile-input v-for="(item,i) in verifyItems"
                        v-model="item.value"
                        :key="i" :item="item" theme="white"
                        @keyUpEnter="showOverlay.res"/>
          <div class="btns">
            <btn-once class="btn btn-green-fill submit"
                      :clickFn="showOverlay.res"
                      :useLoading="true">
              {{$t('sign-in')}}
            </btn-once>
            <button class="btn btn-cancel"
                    @click="showOverlay.rej">{{$t('cancel-1')}}
            </button>
          </div>
        </div>
      </overlay>
    </section>
  </page-container>
</template>

<script>
import MobileInput from 'components/mobile/MobileInput'
import { dataDeal } from 'utils/DataDeal'
import { validateEmail, validatePassword, validateVerifyCode } from 'utils/FormValidate'
import { verifyCodeNumber } from 'utils/InputFormatter'
import { strTrimAll } from 'utils/Utils'
import { mapActions } from 'vuex'

export default {
  name: 'MobileSignIn',
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
          icon: 'icon-user',
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
          icon: 'icon-lock',
        },
      ],
      securities: null,
      showOverlay: null,
      verifyItems: [],
    }
  },
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
      try {
        /* eslint-disable */
        const token = AuthToken.getToken()
        const localStorage = new Storage(true)
        const token_expire = localStorage.get(AuthToken.expireKey)
        const expireTime = token_expire * 1000
        // console.log(this.$route.query)
        // debugger
        if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
          window.webkit.messageHandlers.Login.postMessage({ code: 'success', expire: token_expire, message: token });
        } else if (/(Android)/i.test(navigator.userAgent)) {
          Login.success(token,expireTime)
          // Login.success(expireTime)
        }
        console.log('未检测到设备')
      } catch (e) {
        console.log(e)
      }
      const goBack = this.$route.query.goBack || '0'
      if(Number(goBack) === 1){
        window.history.back(-1)
        // // window.location.href = url
        // window.location.go(-1)
      }
      if (/^https?:\/\//.test(url) && url.startsWith(origin)) {
        window.location.href = url
      } else {
        this.$router.push(url)
      }
    },
  },
  components: { MobileInput },
}
</script>
