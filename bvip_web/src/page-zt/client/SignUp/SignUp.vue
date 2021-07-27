<template>
  <page-container class="sign-up" :title="$t('sign-up')">
    <section class="wrap">
      <div class="top">
        <div class="signup-head">
          <div class="title-lg">{{$t('sign-up')}}</div>
          <div class="h1" v-if="types.length >= 2">
            <template v-for="(r, i) in types">
              <div class="tab"
                   v-if="type!==r.value" :class="{selected: type===r.value}" :key="i">
                <router-link :to="$route.path+'?type=' + r.value
                          + (recommend_code?'&recommend_code=' + recommend_code:'')"
                             >{{r.name}}
                </router-link>
              </div>
              <template v-else>
                <div class="tab selecte" :key="i">
                  {{r.name}}
                </div>
              </template>
            </template>
          </div>
        </div>
        <my-input v-for="item in showItems" v-model="item.value"
                  :key="item.name+type" :item="item" theme="dark" @imgClick="getImgCode"
                  @errorGet="getImgCode"/>
      </div>
      <div class="bottom">
        <btn-once class="submit" :clickFn="submit" :useLoading="true">
          {{$t('sign-up.immediately')}}
        </btn-once>
      </div>
      <div class="other-control">
        <div class="go-login">
            <span class="tip">
              <router-link :to="'/sign-in?redirectTo='+($route.query.redirectTo || '/')">
                {{$t('sign-in.immediately')}}</router-link>
            </span>
        </div>
        <div class="user-agreement">
          <check-box v-model="userAgreement.value" :name="$t(userAgreement.agree)"
                     checkboxSize=".2rem"
                     :icons="{default: 'icon-fangkuang',
                            checked: 'icon-xuanzhong $font-black-c1'}"/>
          <span class="a look-detail" @click="showOverlay=true">{{$t('view')}}</span>
        </div>
      </div>
    </section>
    <my-overlay v-if="showOverlay" @close="showOverlay=false"
                :head="$t('sign-up.agreement')">
      <div class="window">
        <agreement class="agreement" :showDel="true" @close="showOverlay=false"/>
      </div>
    </my-overlay>
    <!--验证吗-->
    <div class="overlay-wrap my-overlay" @click="showVerificate=false"  v-if="showVerificate">
      <div class="window" style="height: 40px;width: 300px;overflow: visible;"
           @click.stop="showVerificate=true">
        <div id="captcha"></div>
      </div>
    </div>
    <div class="bg">
      <img src="../../../assets/register/container-bg.png" alt="">
    </div>
  </page-container>
</template>

<script>
import Agreement from 'components/client/Agreement'
import MyInput from '@/page-zt/components/MyInput2/MyInput-2'
import MyOverlay from 'components/client/MyOverlay'
import { dataDeal } from 'utils/DataDeal'
import { validateEmail, validatePassword } from 'utils/FormValidate'
import { emailPreFormatter, phonePreFormatter, verifyCodeNumber } from 'utils/InputFormatter'
import { strTrimAll } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'SignUp',
  beforeRouteEnter(to, fr, next) {
    if (window.isMobile) {
      window.location.href = `/mobile${window.location.search}`
    } else {
      next()
    }
  },
  beforeMount() {
    // this.getImgCode()
    this.getCountries().catch(this.snackBar.error)
    const register_m = this.siteInfo.default_register_method
    this.$router.replace((register_m === 1 || register_m === 4) ? `${this.$route.path}?type=phone` : `${this.$route.path}?type=email`)
  },
  data() {
    return {
      showOverlay: false,
      showVerificate: false,
      userAgreement: {
        value: '',
        name: 'sign-up.agreement',
        agree: 'sign-up.agreement.agree',
      },
      phone: [
        { name: 'phone.belongs', alias: 'country_id', value: 44, inputType: 'select', options: [], imgUrl: require('assets/register/icon-place.png') },
        {
          name: 'phone',
          alias: 'username',
          value: '',
          prefix: '+86',
          preFormatter: phonePreFormatter,
          placeholder: 'phone',
          inputStyle: { textIndent: '.4rem' },
          imgUrl: require('assets/register/icon-phone.png'),
        },
      ],
      email: [
        {
          name: 'email',
          alias: 'username',
          value: '',
          preFormatter: emailPreFormatter,
          placeholder: 'email',
          autocomplete: 'on',
          validator: validateEmail,
          imgUrl: require('assets/register/icon-message.png'),
        },
      ],
      items: this.itemsFn(),
      imgCode: null,
    }
  },
  computed: {
    ...mapState(['siteInfo']),
    ...mapState('user', ['countries']),
    type() {
      const type = { 1: 'phone', 2: 'email' }
      return this.$route.query.type || type[this.siteInfo.default_register_method] || 'phone'
    },
    types() {
      const items = [
        { name: this.$t('phone-1'), value: 'phone' },
        { name: this.$t('email'), value: 'email' },
      ]
      switch (this.siteInfo.default_register_method) {
        case 3:// 只能邮箱注册
          items.splice(0, 1)
          break;
        case 4:// 只能手机注册
          items.splice(1, 1)
          break;
        default:
          break;
      }
      return this.type === 'email' ? [...items].reverse() : items
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
      return this.$route.query.recommend_code || ''
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
    // imgCode(val) {
    //   if (val) this.$set(this.items, 0, { ...this.items[0], imgCode: val.url })
    // },
    '$route'() {
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
      return (this.userAgreement.value ? Promise.resolve()
        : Promise.reject(this.$t('sign-up.agreement.tip')))
        .then(() => this.validate(this.showItems))
        .then(() => this.register({
          ...dataDeal(this.showItems),
        }))
        .then(() => {
          this.snackBar.info(this.$t('sign-up.success'))
          const url = this.$route.query.redirectTo || '/'
          if (/^https?:\/\//.test(url)) {
            window.location.href = url
          } else {
            this.$router.push(url)
          }
        })
    },
    // 显示网易云盾
    showSms() {
      const items = this.showItems.slice(0, this.type === 'phone' ? 2 : 1)
      return this.validate(items)
        .then(() => {
          this.showVerificate = true
          this.initVerificate()
        })
    },
    // 初始化验证码
    initVerificate() {
      const self = this
      /* eslint-disable */
      initNECaptcha({
        captchaId: '6c357ed0034449fd9b3d8684f612b2ab',
        element: '#captcha',
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
    getSms(data) {
      const items = this.showItems.slice(0, this.type === 'phone' ? 2 : 1)
      return this.validate(items)
        .then(() => this.getCode({
          ...dataDeal(items),
          use_type: 0,
          validate_method: 1,
          img_code: data.validate,
        }).then(() => {
          this.snackBar.info(this.$t('verify.code.get.success'))
        }).catch(this.snackBar.error))
    },
    itemsFn() {
      const recommend_code = this.$route.query.recommend_code || ''
      const { recommend_code_force } = this.$store.state.siteInfo
      return [
        // {
        //   name: 'verify.code.img',
        //   alias: 'img_code',
        //   value: '',
        //   placeholder: 'verify.code.img',
        //   preFormatter: verifyCodeNumber,
        //   imgCode: '',
        //   imgUrl: require('assets/register/icon-yzm.png'),
        // },
        {
          name: 'verify.code',
          alias: 'code',
          value: '',
          placeholder: 'verify.code',
          preFormatter: verifyCodeNumber,
          autocomplete: 'on',
          btnText: 'verify.code.get',
          btnCodeFn: () => this.showSms(),
          imgUrl: require('assets/register/icon-dxyzm.png'),
        },
        {
          name: 'password',
          inputType: 'password',
          alias: 'password',
          autocomplete: 'on',
          value: '',
          preFormatter: strTrimAll,
          validator: validatePassword,
          placeholder: 'password.tip',
          imgUrl: require('assets/register/icon-suo1.png'),
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
          imgUrl: require('assets/register/icon-suo2.png'),
        },
        {
          name: 'recommend.code',
          alias: 'recommend_code',
          value: recommend_code,
          preFormatter: strTrimAll,
          autocomplete: 'on',
          placeholder: 'recommend.code.tip',
          required: !!recommend_code_force,
          canEdit: !recommend_code,
          imgUrl: require('assets/register/icon-people.png'),
        },
      ]
    },
  },
  components: { MyInput, Agreement, MyOverlay },
}
</script>
