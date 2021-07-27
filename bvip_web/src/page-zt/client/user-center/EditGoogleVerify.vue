<template>
  <page-container class="user-content bind-google-verify" :title="title">
    <nav-head :nav="nav"></nav-head>
    <div class="content-detail">
      <div class="nav-box">
        <nav-head :nav="nav2" class="nav-content"></nav-head>
      </div>
      <div v-if="nav2.selected === 1" class="nav-detail nav-detail-1">
        <div>
          <img :src="require('assets/client/user-center/zt/google-register.png')" alt=""><br>
          <span>{{$t('verify.code.google')}}</span>
        </div>
        <div>
          <p>{{$t('verify.google.setup.tip-2')}}</p>
          <div class="download-box">
            <p v-for="(item, idx) in downloadTip" :key="idx" class="download-item">
              <img :src="item.url" alt=""><br>
              <span>{{item.name}}</span>
            </p>
          </div>
        </div>
        <div>
          <button class="btn next-step" @click="nav2.selected = 2">{{$t('next')}}
          </button>
        </div>
      </div>
      <div v-if="nav2.selected === 2" class="nav-detail nav-detail-2">
        <div>
          <p>
            <span>1</span>
            {{$t('verify.google.setup.tip-3')}}
          </p>
          <div class="get-code">
            <div class="qr-code">
              <img class="qrcode" :src="tip.qrcode" alt="">
            </div>
            <div class="name-pwd">
              <p>
                {{$t('verify.account')}}：{{user.username}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {{$t('verify.secret')}}：{{tip.secretKey}}
              </p>
            </div>
          </div>
        </div>
        <div>
          <p>
            <span>2</span>
            {{$t('verify.google.setup.tip-4')}}
          </p>
          <div class="form">
            <my-input v-for="(item,i) in showItems" type="1"
                      class="item" :key="i" v-model="item.value"
                      :item="item" @btnClick="getCode(item.alias)"/>
            <btn-once class="submit btn-blue" :clickFn="submit" :useLoading="true">
              {{$t('submit')}}
            </btn-once>
          </div>
        </div>
      </div>
      <div v-if="nav2.selected === 3" class="nav-detail nav-detail-3">
        <p>
          <img
            :src="require('assets/client/user-center/zt/google-register-success.png')" alt=""><br>
          <span>{{$t('verify.google.setup.tip-5')}}</span>
        </p>
        <p>
          <btn-once class="submit btn-blue" style="margin: 0" :clickFn="toBack">
            {{$t('verify.return')}}
          </btn-once>
        </p>
      </div>
    </div>
  </page-container>
</template>

<script>
import MyInput from 'components/client/MyInput'
// import TabHead from 'components/client/user-center/TabHead'
import NavHead from '@/page-zt/components/user-center/NavHead'
import { dataDeal } from 'utils/DataDeal'
import { verifyCodeNumber } from 'utils/InputFormatter'
import { QrCode, strTrimAll } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'
import IOSImg from '../../../assets/client/user-center/zt/IOS.png'
import AndroidImg from '../../../assets/client/user-center/zt/android.png'

export default {
  name: 'BindGoogleVerify',
  beforeMount() {
    this.getSecurity().catch(this.snackBar.error)
    this.getKey()
  },
  data() {
    return {
      nav: {
        value: 1,
        options: [
          { name: this.$t('user.security'), url: '/user-center/security' },
          { name: this.$t('verify.google'), url: '' },
        ],
      },
      nav2: {
        value: 2,
        selected: 1,
        options: [
          { name: `1、${this.$t('nav-2-1')}`, url: '' },
          { name: `2、${this.$t('nav-2-2')}`, url: '' },
          { name: `3、${this.$t('nav-2-3')}`, url: '' },
        ],
      },
      tip: {
        secretKey: '',
        qrcode: '',
        tip: 'verify.google.bind.tip',
      },
      downloadTip: [
        {
          name: 'IOS',
          url: IOSImg,
        },
        {
          name: 'Android',
          url: AndroidImg,
        },
      ],
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
        item.value = { ...this.user }[item.alias]
        return item
      })
    },
    title() {
      return this.$t('bind') + this.$t('verify.google')
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
    toBack() {
      this.$router.replace('/user-center/security')
    },
  },
  components: { MyInput, NavHead },
}
</script>
