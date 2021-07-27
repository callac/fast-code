<template>
  <page-container class="mobile-sign-up mobile-sign-in" :title="title">
    <div class="mobile-page-container">
      <header-mobile></header-mobile>
      <template v-if="routetType === 'sign-up'">
        <div class="tabs">
          <div class="tabs-item" v-for="(t,i) in types" :key="i">
            <router-link :to="$route.path+'?type=' + t.value
                          + (recommend_code?'&recommend_code=' + recommend_code:'')"
                         :class="{selected: type===t.value}" replace>{{t.name}}
            </router-link>
          </div>
        </div>
        <div class="wrap">
          <div class="forms">
            <template v-for="item in showItems">
              <div class="mobile-input" type="1" theme="white"
                   :key="item.name+type" v-if="item.alias ==='code'">
                <label for="验证码" class="label">{{$t(item.name)}}</label>
                <input id="验证码" type="number" v-model="item.value"
                       placeholder="" autocomplete="off" class="input-base">
                <button class="btn-code btn" @click="showSms" v-if="timeState">获取验证码</button>
                <button class="btn-code btn" disabled="disabled" v-else>
                  {{time}}S
                </button>
              </div>
              <div class="mobile-input" type="1" theme="white" :key="item.name+type"
                   v-else-if="item.inputType ==='tel'">
                <label for="手机号" class="label">{{$t(item.name)}}</label>
                <input id="手机号" type="tel" v-model="item.value" placeholder=""
                       autocomplete="on" class="input-base" />
              </div>
              <div class="mobile-input" type="1" theme="white" :key="item.name+type"
                   v-else-if="item.inputType ==='email'">
                <label for="邮箱" class="label">{{$t(item.name)}}</label>
                <input id="邮箱" type="email" v-model="item.value" placeholder=""
                       autocomplete="on" class="input-base" />
              </div>
              <mobile-input v-model="item.value" type="1" v-else
                            :key="item.name+type" :item="item" theme="white" @imgClick="getImgCode"
                            @errorGet="getImgCode"/>
            </template>
          </div>
          <div class="bottom">
            <btn-once class="btn-green-fill submit" :clickFn="submit" :useLoading="true">
              {{$t('sign-up.immediately')}}
            </btn-once>
            <!--<span class="tip">{{$t('account.exist')}}?
              <router-default-link :to="'/sign-in?redirectTo='+($route.query.redirectTo || '/')">
                {{$t('sign-in.immediately')}}</router-default-link>
            </span>-->
          </div>
        </div>
        <footer @click="switchAgree">
          <!--<check-box v-model="userAgreement.value"-->
          <!--checkboxSize=".22rem"-->
          <!--:icons="{default: 'icon-checkbox-un',-->
          <!--checked: 'icon-checkbox font-green'}"/>-->
          {{$t('mobile.agree')}}
          <button class="btn btn-green"
                  @click.stop="showOverlay='agree'">{{$t('mobile.login-agreement')}}
          </button>
          <!--{{$t('and')}}-->
          <!--<button class="btn btn-green"-->
          <!--@click.stop="showOverlay='pri'">{{$t('about-us.privacy-policy')}}-->
          <!--</button>-->
        </footer>
        <div class="window" v-if="showOverlay" @click="showOverlay=false">
          <agreement v-if="showOverlay==='agree'" class="agreement" :showDel="true"
                     @close="showOverlay=false"/>
          <privacy v-else class="agreement" :showDel="true" @close="showOverlay=false"/>
        </div>
        <div class="window" style="height: 0.41rem;overflow: visible;top: 50%;margin-top: -0.2rem;"
             v-if="showVerificate" @click="showOverlay=false">
          <div id="captcha"></div>
        </div>
      </template>

      <SignIn v-else></SignIn>
    </div>
  </page-container>
</template>

<script>
import Agreement from 'components/client/Agreement'
import Privacy from 'components/client/Privacy'
import MobileInput from 'components/mobile/MobileInput'
import { dataDeal } from 'utils/DataDeal'
import { validateEmail, validatePhoneNumber, validatePassword, validateVerifyCode } from 'utils/FormValidate'
import { emailPreFormatter, phonePreFormatter, verifyCodeNumber } from 'utils/InputFormatter'
import { getSignUpConfig } from 'utils/SignUp'
import { strTrimAll } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'
import HeaderMobile from './HeaderMobile'
import SignIn from './SignIn'

export default {
  name: 'SignUp',
  beforeMount() {
    // this.getImgCode()
    this.getCountries().catch(this.snackBar.error)
    this.items = this.itemsFn()
  },
  beforeDestroy() {
    clearInterval(this.timeInterval)
  },
  data() {
    return {
      showOverlay: '',
      showVerificate: false,
      userAgreement: {
        value: '',
        name: 'sign-up.agreement',
      },
      phone: [
        {
          name: 'phone.belongs',
          alias: 'country_id',
          value: 44,
          inputType: 'select',
          options: [],
          // icon: 'icon-pos',
        },
        {
          name: 'phone',
          alias: 'username',
          value: '',
          inputType: 'tel',
          autocomplete: 'on',
          prefix: '+86',
          preFormatter: phonePreFormatter,
          // placeholder: 'phone',
          // inputStyle: { textIndent: '.4rem' },
          validator: val => this.phone[0].value !== 44 || validatePhoneNumber(val),
        },
      ],
      email: [
        {
          name: 'email',
          alias: 'username',
          value: '',
          inputType: 'email',
          autocomplete: 'on',
          preFormatter: emailPreFormatter,
          // placeholder: 'email',
          // icon: 'icon-youxiang',
          validator: validateEmail,
        },
      ],
      items: [],
      imgCode: null,
      time: 60, // 发送验证码倒计时
      timeState: true, // 是否可以发送验证码
      timeInterval: null, // 倒计时状态
    }
  },
  computed: {
    ...mapState(['siteInfo']),
    ...mapState('user', ['countries']),
    config() {
      return getSignUpConfig(this.siteInfo.default_register_method)
    },
    type() {
      return this.$route.query.type || this.config.defaultType
    },
    types() {
      const items = this.config.types.map(s => ({
        ...s,
        name: s.name((...args) => this.$t(...args)),
      }))
      return this.type === 'email' ? [...items].reverse() : items
    },
    routetType() {
      return this.$route.query.routeType ? this.$route.query.routeType : 'sign-up'
    },
    title() {
      return this.routetType === 'sign-up' ? '注册' : '登录'
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
    recommend_code() {
      return this.$route.query.recommend_code || this.$route.query.r_user_id || ''
    },
  },
  watch: {
    countryOptions(val) {
      this.$set(this.phone, 0, { ...this.phone[0], options: val })
    },
    'phone.0.value'(val) {
      const co = this.countries.find(c => c.ID === +val)
      this.$set(this.phone[1], 'prefix', co.area_code)
    },
    // imgCode(val) {
    //   if (val) this.$set(this.items, 0, { ...this.items[0], imgCode: val.url })
    // },
    '$route'() {
      this.timeState = true // 是否可以发送验证码
      this.items = this.itemsFn()
      this.getImgCode()
    },
  },
  methods: {
    ...mapActions('user', ['getCountries', 'getCode', 'register', 'getCodeImg']),
    getImgCode() {
      return this.getCodeImg()
        .then((res) => {
          this.imgCode = res
        }).catch(this.snackBar.error)
    },
    submit() {
      // return (this.userAgreement.value ? Promise.resolve() :
      // Promise.reject(this.$t('sign-up.agreement.tip')))
      //   .then(() => this.validate(this.showItems))
      return this.validate(this.showItems)
        .then(() => this.register({
          ...dataDeal(this.showItems),
        })
          .then(() => {
            this.snackBar.info(this.$t('sign-up.success'))
            const url = this.$route.query.redirectTo || '/'
            const { origin } = window.location
            if (/^https?:\/\//.test(url) && url.startsWith(origin)) {
              window.location.href = url
            } else {
              this.$router.push(url)
              const Timeer = () => {
                setTimeout(() => {
                  if (window.location.pathname === '/') {
                    window.location.reload()
                  } else {
                    Timeer();
                  }
                }, 500)
              }
              Timeer();
            }
          }))
    },
    // 显示网易云盾
    showSms() {
      const items = this.showItems.slice(0, this.type === 'phone' ? 2 : 1)
      this.validate(items)
        .then(() => {
          this.showVerificate = true
          this.initVerificate()
        }).catch(this.snackBar.error)
    },
    // 初始化验证码
    initVerificate() {
      const self = this
      /* eslint-disable */
      initNECaptcha({
        captchaId: '6c357ed0034449fd9b3d8684f612b2ab',
        element: '#captcha',
        mode:'popup',
        onReady: function (instance) {
          // 验证码一切准备就绪，此时可正常使用验证码的相关功能
          console.log(instance)
        },
        onVerify: function (err, data) {
          console.log(err, data)
          /**
           * 第一个参数是err（Error的实例），验证失败才有err对象
           * 第二个参数是data对象，验证成功后的相关信息，data数据结构为key-value，如下：
           * {
         *   validate: 'xxxxx' // 二次验证信息
         * }
           **/
          if (err) return  // 当验证失败时，内部会自动refresh方法，无需手动再调用一次
          self.showVerificate = false
          self.getSms(data)
        }
      }, function onload (instance) {
        // 初始化成功
        console.log(instance)
      }, function onerror (err) {
        // 验证码初始化失败处理逻辑，例如：提示用户点击按钮重新初始化
        console.log(err)
      })
    },
    // 倒计时
    timeDown(){
      this.timeState=false
      this.time = 60
      this.timeInterval=setInterval(()=>{
        this.time = this.time - 1
        if(this.time === 0){
          clearInterval(this.timeInterval)
          this.timeState=true
        }
      },1000)
    },
    getSms(data) {
      const items = this.showItems.slice(0, this.type === 'phone' ? 2 : 1)
      return this.validate(items)
        .then(() => this.getCode({
          ...dataDeal(items),
          use_type: 0,
          // id: this.imgCode.id,
          validate_method: 1,
          img_code: data.validate,
        }).then(() => {
          this.timeDown()
          this.snackBar.info(this.$t('verify.code.get.success'))
        }).catch(this.snackBar.error))
    },
    switchAgree() {
      this.userAgreement.value = this.userAgreement.value === 'checked' ? '' : 'checked'
    },
    itemsFn() {
      return [
        // {
        //   name: 'verify.code.img',
        //   alias: 'img_code',
        //   value: '',
        //   placeholder: 'verify.code.img',
        //   preFormatter: verifyCodeNumber,
        //   validator: validateVerifyCode,
        //   imgCode: '',
        //   icon: 'icon-img-code',
        // },
        {
          name: 'verify.code',
          alias: 'code',
          value: '',
          inputType: 'number',
          // placeholder: 'verify.code',
          preFormatter: verifyCodeNumber,
          validator: validateVerifyCode,
          btnText: 'verify.code.get',
          btnCodeFn: () => this.showSms(),
          // icon: 'icon-security',
        },
        {
          name: 'password',
          inputType: 'password',
          alias: 'password',
          value: '',
          autocomplete: 'on',
          preFormatter: strTrimAll,
          validator: validatePassword,
          placeholder: 'password.tip',
          // icon: 'icon-lock',
        },
        {
          name: 'password.confirm',
          alias: 'password_confirmation',
          inputType: 'password',
          value: '',
          autocomplete: 'on',
          preFormatter: strTrimAll,
          validator: validatePassword,
          placeholder: 'password.confirm',
          // icon: 'icon-lock',
        },
        {
          name: 'recommend.code',
          alias: 'recommend_code',
          value: this.recommend_code,
          preFormatter: strTrimAll,
          placeholder: 'recommend.tip',
          required: false,
          // icon: 'icon-sub-account',
          canEdit: !this.recommend_code,
        },
      ]
    },
  },
  components: { MobileInput, Agreement, Privacy, HeaderMobile, SignIn },
}
</script>
