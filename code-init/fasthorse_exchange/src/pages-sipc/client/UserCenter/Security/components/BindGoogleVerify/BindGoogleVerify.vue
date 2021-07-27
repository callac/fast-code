<template>
  <my-overlay
    v-if="show"
    class="bind-google-verify"
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
    <div class="tip">
      <img class="qrcode" :src="tip.qrcode" alt="">
      <span class="span">{{$t(tip.tip)}}</span>
    </div>
    <div class="download-tip">
      <h3 class="h3">{{$t('verify.google.setup')}}</h3>
      <div v-for="(c,i) in downloadTip" class="client" :key="i">
        <h4 class="h4">{{c.client}}</h4>
        <span class="span">{{$t(c.desc)}}</span>
        <a :href="c.url" class="a font-green" target="download">{{$t('download')}}</a>
      </div>
    </div>
  </my-overlay>
</template>

<script>
import MyInput from 'components/client/MyInput'
import MyOverlay from 'components/client/MyOverlay'
import { dataDeal } from 'utils/DataDeal'
import { validateVerifyCode } from 'utils/FormValidate'
import { verifyCodeNumber } from 'utils/InputFormatter'
import { QrCode, strTrimAll } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'BindGoogleVerify',
  components: { MyOverlay, MyInput },
  data() {
    return {
      show: false,
      tip: {
        secretKey: '',
        qrcode: '',
        tip: 'verify.google.bind.tip',
      },
      downloadTip: [
        {
          client: 'iPhone',
          desc: 'verify.google.setup.tip',
          url: 'https://itunes.apple.com/cn/app/google-authenticator/id388497605?mt=8',
        },
        {
          client: 'Android',
          desc: 'verify.google.setup.tip-1',
          url: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2',
        },
      ],
      items: [
        {
          name: 'secretKey',
          alias: 'secretKey',
          value: '',
          placeholder: '',
          errorText: '',
          canEdit: false,
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
          validator: validateVerifyCode,
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
        item.value = { ...this.user, ...this.tip }[item.alias]
        return item
      })
    },
    title() {
      return this.$t('bind') + this.$t('verify.google')
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
      return this.items1.filter(item => Object.keys(this.security).every((key) => {
        const include = item.name.includes(key)
        return key === 'google' || !include || (include && this.security[key])
      }))
    },
  },
  methods: {
    ...mapActions('user', ['getSecurity', 'getUserInfo', 'setGoogle', 'getCodeAfterLogin', 'getGoogleVerify']),
    getCode(alias) {
      const type = alias === 'email_code' ? '1' : '0'
      return this.getCodeAfterLogin({ type, use_type: 3 }).then(() => {
        this.snackBar.info(this.$t('verify.code.get.success'))
      })
    },
    getKey() {
      return this.getGoogleVerify().then((res) => {
        QrCode(res.url).then((url) => {
          this.tip.secretKey = res.secret
          this.tip.qrcode = url
        })
      }).catch(this.snackBar.error)
    },
    submit() {
      return this.validate(this.showItems)
        .then(() => this.setGoogle(dataDeal(this.showItems)).then(() => {
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
    this.getKey()
  },
}
</script>
