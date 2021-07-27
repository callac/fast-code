<template>
  <page-container class="sign-in" :title="$t('sign-in')">
    <section class="wrap">
      <div class="top">
        <h1 class="h1">{{$t('sign-in')}}</h1>
        <my-input v-for="(item,i) in items" v-model="item.value"
                  :key="i" :item="item" theme="dark" @keyUpEnter="submit().catch(snackBar.error)"/>
      </div>
      <div class="bottom">
        <btn-once class="btn-green-fill submit" :clickFn="submit" :useLoading="true">
          {{$t('sign-in.immediately')}}
        </btn-once>
      </div>
      <div class="tips">
        <router-link class="forget-p" to="/password/reset">{{$t('password.forget')}}?</router-link>
        <span>{{$t('account.none')}}?
          <router-link :to="'/sign-up?redirectTo='+($route.query.redirectTo || '/')">
            {{$t('sign-up.immediately')}}</router-link>
        </span>
      </div>
      <overlay v-if="showOverlay" @click="showOverlay.rej()">
        <div class="verify-items">
          <h2 class="title">{{$t('verify.security')}}
            <!--<span class="iconfont icon-del" @click="showOverlay.rej()"></span>--></h2>
          <my-input v-for="(item,i) in verifyItems" v-model="item.value"
                    :key="i" :item="item" :headTest="userInfo" theme="white"
                    @keyUpEnter="showOverlay.res"/>
          <div class="btns">
            <btn-once class="submit yzm-btn" :clickFn="showOverlay.res" :useLoading="true">
              {{$t('sign-in')}}
            </btn-once>
            <!--<button class="btn-cancel" @click="showOverlay.rej">{{$t('cancel-1')}}</button>-->
          </div>
        </div>
      </overlay>
    </section>
    <div class="bg">
      <img src="../../../assets/register/container-bg.png" alt="">
    </div>
  </page-container>
</template>

<script>
import MyInput from '@/page-zt/components/MyInput2/MyInput-2'
import { dataDeal } from 'utils/DataDeal'
import { validateEmail, validatePassword } from 'utils/FormValidate'
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
          imgUrl: require('assets/register/icon-people.png'),
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
          imgUrl: require('assets/register/icon-suo1.png'),
        },
      ],
      securities: null,
      showOverlay: null,
      userInfo: null,
    }
  },
  computed: {
    verifyItems() {
      if (!this.securities) return []
      const items = [
        {
          name: 'verify.code.phone',
          aliasName: 'phone',
          alias: 'sms_code',
          value: '',
          placeholder: 'verify.code.phone',
          preFormatter: verifyCodeNumber,
          errorText: '',
          headTest: this.userInfo.phone,
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode('sms_code'),
          imgUrl: require('assets/register/icon-dxyzm2.png'),
        },
        {
          name: 'verify.code.email',
          aliasName: 'email',
          alias: 'email_code',
          value: '',
          placeholder: 'verify.code.email',
          preFormatter: verifyCodeNumber,
          errorText: '',
          headTest: this.userInfo.email,
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode('email_code'),
          imgUrl: require('assets/register/icon-dxyzm2.png'),
        },
        {
          name: 'verify.code.google',
          aliasName: 'google',
          alias: 'two_step_code',
          value: '',
          preFormatter: strTrimAll,
          placeholder: '',
          errorText: '',
          headTest: ' ',
          imgUrl: require('assets/register/icon-dxyzm2.png'),
        },
      ]
      // return items
      return items.filter(item => this.securities[item.aliasName])
    },
  },
  methods: {
    ...mapActions('user', ['signIn', 'safeLogin', 'getCodeAfterLogin', 'getUserInfo']),
    getCode(alias) {
      const type = alias === 'sms_code' ? '0' : '1'
      return this.getCodeAfterLogin({
        type,
        use_type: 1,
      }).then(() => {
        this.snackBar.info(this.$t('verify.code.get.success'))
      })
    },
    submit() {
      return this.validate(this.items)
        .then(() => this.signIn(dataDeal(this.items))
          .then((res) => {
            this.userInfo = res
            // console.log(this.userInfo)
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
      if (/^https?:\/\//.test(url)) {
        window.location.href = url
      } else {
        this.$router.push(url)
      }
    },
  },
  components: { MyInput },
}
</script>
