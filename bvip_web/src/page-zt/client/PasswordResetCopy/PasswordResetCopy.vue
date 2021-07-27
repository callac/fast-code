<template>
  <page-container class="password-reset" :title="$t('password.reset')">
    <section class="wrap">
      <div class="top">
        <div class="signup-head">
          <div class="title-lg">{{$t('reset')}}{{$t('password')}}</div>
          <div class="h1">
            <template v-for="(r, i) in types">
              <div class="tab"
                   v-if="type!==r.value" :class="{selected: type===r.value}" :key="i">
                <router-link v-if="type!==r.value" :class="{selected: type===r.value}"
                             :to="$route.path+'?type='+r.value" :key="i">{{r.name}}
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
        <my-input v-for="(item,i) in showItems" v-model="item.value"
                  :key="i" :item="item" theme="white" @imgClick="getImgCode"
                  @errorGet="getImgCode"/>
      </div>
      <div class="bottom">
        <btn-once class="btn-green-fill submit" :clickFn="submit" :useLoading="true">
          <!--{{$t('submit')}}-->
          {{$t('password.reset-1')}}
        </btn-once>
      </div>
      <p class="tip">{{$t('account.none')}}?
          <router-link to="/sign-up">{{$t('sign-up.immediately')}}</router-link>
        </p>
    </section>
    <!--验证吗-->
    <div class="overlay-wrap my-overlay" @click="showVerificate=false"  v-if="showVerificate">
      <div class="window" style="height: 40px;width: 300px;overflow: visible;"
           @click.stop="showVerificate=true">
        <div id="captcha"></div>
      </div>
    </div>
  </page-container>
</template>

<script>
import MyInput from '@/page-zt/components/MyInput2/MyInput-2'
import { dataDeal } from 'utils/DataDeal'
import { validateEmail, validatePassword } from 'utils/FormValidate'
import { emailPreFormatter, phonePreFormatter, verifyCodeNumber } from 'utils/InputFormatter'
import { strTrimAll } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'PasswordReset',
  beforeMount() {
    // this.getImgCode()
    this.getCountries().catch(this.snackBar.error)
    this.$set(
      this.items,
      0,
      {
        ...this.items[0],
        placeholder: this.type === 'phone'
          ? 'verify.code.message'
          : 'verify.code.email' },
    )
  },
  data() {
    return {
      showVerificate: false, // 网易云盾弹窗状态
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
          imgUrl: require('assets/register/icon-message.png'),
          validator: validateEmail,
        },
      ],
      items: [
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
          placeholder: 'verify.code.message',
          preFormatter: verifyCodeNumber,
          btnText: 'verify.code.get',
          btnCodeFn: () => this.showSms(),
          imgUrl: require('assets/register/icon-dxyzm.png'),
        },
        {
          name: 'password',
          inputType: 'password',
          alias: 'password',
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
          preFormatter: strTrimAll,
          validator: validatePassword,
          placeholder: 'password.tip',
          imgUrl: require('assets/register/icon-suo2.png'),
        },
      ],
      imgCode: null,
    }
  },
  computed: {
    ...mapState('user', ['countries']),
    type() {
      return this.$route.query.type || 'phone'
    },
    types() {
      const items = [
        { name: this.$t('phone-1'), value: 'phone' },
        { name: this.$t('email'), value: 'email' },
      ]
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
    type(val) {
      this.$set(
        this.items,
        0,
        {
          ...this.items[0],
          placeholder: val === 'phone'
            ? 'verify.code.message'
            : 'verify.code.email' },
      )
    },
  },
  methods: {
    ...mapActions('user', ['getCountries', 'getCode', 'getCodeImg', 'resetPassword']),
    getImgCode() {
      return this.getCodeImg()
        .then((res) => {
          this.imgCode = res
        }).catch(this.snackBar.error)
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
        onReady: function () {
          // 验证码一切准备就绪，此时可正常使用验证码的相关功能
          // console.log(instance)
        },
        onVerify: function (err, data) {
          // console.log(err, data)
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
          use_type: 2,
          // id: this.imgCode.id,
          validate_method: 1,
          img_code: data.validate,
        }).then(() => {
          this.snackBar.info(this.$t('verify.code.get.success'))
        }).catch(this.snackBar.error))
    },
    submit() {
      return this.validate(this.showItems)
        .then(() => this.resetPassword(dataDeal(this.showItems))
          .then(() => {
            this.snackBar.info(this.$t('password.reset.success'))
            this.$router.push('/sign-in')
          }))
    },
  },
  components: { MyInput },
}
</script>
