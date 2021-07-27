<template>
  <page-container class="sipc-content security" :title="$t('user.security')">
    <h1 class="content page-head">{{$t('user.security')}}</h1>
    <div class="level content-wrap-1">
      <img class="img" :src="require('./assets/avatar.png')" alt="">
      <div class="u-content">
        <h3 class="h3">
          <span class="username">{{user.username}}</span>
          <button
            v-if="user.identity_status===2"
            class="btn btn-main-fill"
          >{{$t('authorized')}}
          </button>
          <router-link
            v-else
            class="btn btn-main-fill"
            to="/user-center/certification"
          >{{$t('authorize')}}
          </router-link>
          <span class="last-login">
            {{$t('sign-in.last')}}: {{user.last_login|datePipe('')}}
            (IP: {{user.last_ip}})
          </span>
        </h3>
        <p class="uid">UID: {{user.id}}</p>
      </div>
    </div>
    <div class="content-wrap-1">
      <div class="tab-wrap">
        <div class="tab selected">{{$t('security.setting')}}</div>
      </div>
      <div class="security-item">
        <img
          class="icon"
          :src="require('./assets/icon-check-yes.png')"
        >
        <h3 class="name">{{$t('security.level.tip')}}</h3>
        <div class="value">
          <template v-if="level.level">
            <div class="progress">
              <div class="bar"
                   :style="{ width: 'calc(100% / 3 * '+level.level+')', background: level.color }"
              ></div>
            </div>
            {{$t(Status.securityLevel[level.level].name)}}
          </template>
        </div>
        <div class="operate"></div>
      </div>
      <div v-for="(item, i) in items" class="security-item" :key="i">
        <img
          v-if="(item.alias!=='identity_status'&&item.status.indexOf('un')!==0)
            ||(item.alias==='identity_status'&&item.status==='authorized')"
          class="icon"
          :src="require('./assets/icon-check-yes.png')"
        >
        <img
          v-else
          class="icon"
          :src="require('./assets/icon-check-no.png')"
        >
        <h3 class="name">{{$t(item.name)}}</h3>
        <span class="value">
        {{item.value||$t(item.placeholder)||$t(item.name)}}</span>
        <div class="operate">
          <template v-for="(r, i) in item.operate">
            <template v-if="(i!=='bind'&&['bound','beenSet'].includes(item.status))
          ||!(['phone','email','verify.google','password.fund','user.certification']
              .includes(item.name))
          ||(i==='bind'&&!['bound','authorized'].includes(item.status))
          || (i==='cer'&&r.text(item))">
              <router-link v-if="r.route" class="op font-blue" :key="i" :to="r.route">
                {{$t(typeof r.text === 'function'?r.text(item):r.text)}}
              </router-link>
              <button v-else-if="canClose||(!canClose&&!item.verifyOpened)"
                      class="op font-blue" :key="i"
                      @click="r.click(item.security||item.name, item.verifyOpened?'close':'open')">
                {{$t(typeof r.text === 'function'?r.text(item):r.text)}}
              </button>
            </template>
          </template>
        </div>
      </div>
    </div>
    <div class="content-wrap-1">
      <tab-head class="h2" v-model="history.value" :options="history.options"/>
      <br>
      <my-table :heads="loginHeads" :data="loginData" :sort="false" :searching="searching"/>
    </div>
    <my-overlay v-if="showOverlay" @close="showOverlay.rej()" :head="$t(showOverlay.head)">
      <my-input v-for="(item,i) in showOverlay.items" type="1" :key="i" :item="item"
                v-model="item.value"/>
      <button class="submit btn-main-fill" @click="close">{{$t('submit')}}</button>
      <span class="tip font-red">
          {{$t('security.switch.tip', {type: $t(showOverlay.type)})}}
        </span>
    </my-overlay>
    <bind-email ref="$bindEmail"/>
    <bind-google-verify ref="$bindGoogleVerify"/>
    <bind-phone ref="$bindPhone"/>
    <reset-password ref="$resetPassword"/>
    <set-fund-password ref="$setFundPassword"/>
  </page-container>
</template>

<script>
import BindEmail from '@/pages-sipc/client/UserCenter/Security/components/BindEmail/BindEmail'
import BindGoogleVerify from '@/pages-sipc/client/UserCenter/Security/components/BindGoogleVerify/BindGoogleVerify'
import BindPhone from '@/pages-sipc/client/UserCenter/Security/components/BindPhone/BindPhone'
import ResetPassword from '@/pages-sipc/client/UserCenter/Security/components/ResetPassword/ResetPassword'
import SetFundPassword from '@/pages-sipc/client/UserCenter/Security/components/SetFundPassword/SetFundPassword'
import MyInput from 'components/client/MyInput'
import MyOverlay from 'components/client/MyOverlay'
import TabHead from 'components/client/user-center/TabHead'
import Status from 'data/immutable-data/Status'
import { dataDeal } from 'utils/DataDeal'
import { validateVerifyCode } from 'utils/FormValidate'
import { verifyCodeNumber } from 'utils/InputFormatter'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'Security',
  components: {
    TabHead,
    MyOverlay,
    MyInput,
    BindEmail,
    BindGoogleVerify,
    BindPhone,
    ResetPassword,
    SetFundPassword,
  },
  data() {
    return {
      searching: false,
      showOverlay: null,
      Status,
      loginHeads: [
        { name: 'time', alias: 'time' },
        { name: 'IP', alias: 'ip', needTran: false },
        { name: 'login.type', alias: 'type', style: { textAlign: 'right' } },
      ],
      history: {
        value: '',
        options: [
          { name: 'login.history', value: '' },
        ],
      },
    }
  },
  computed: {
    ...mapState('user', {
      user: state => state.info,
      security: 'security',
      loginHistory: 'loginHistory',
    }),
    ...mapGetters(['siteInfo']),
    loginData() {
      return this.loginHistory.map(item => ({
        ...item,
        time: this.dateFormatter(item.CreatedAt),
        type: item.endpoint || 'Web',
      }))
    },
    level() {
      const level = Object.keys(this.security).filter(k => this.security[k]).length
      const colors = {
        3: '#43c172',
        2: '#eec05e',
        1: '#f2843a',
      }
      return {
        color: colors[level],
        level,
      }
    },
    canClose() {
      return Object.keys(this.security).filter(k => this.security[k]).length > 1
    },
    items() {
      const route = this.$route.path
      const items = [
        {
          icon: 'icon-password_icon',
          name: 'password',
          alias: 'password',
          status: Status.setStatus[1].name,
          operate: {
            bind: {
              text: 'reset',
              click: () => this.openModal('$resetPassword'),
            },
          },
        },
        {
          icon: 'icon-shouji',
          name: 'phone',
          security: 'phone',
          alias: 'phone_bound',
          statusObj: Status.boundStatus,
          value: '',
          placeholder: 'phone.tip',
          operate: {
            bind: {
              text: 'bind',
              click: () => this.openModal('$bindPhone'),
            },
            toggleVerify: {
              text: ({ verifyOpened }) => (!verifyOpened ? 'verify.open' : 'verify.close'),
              click: (type, value) => this.toggleVerify(type, value),
            },
          },
        },
        {
          icon: 'icon-youxiang',
          name: 'email',
          security: 'email',
          alias: 'email_bound',
          statusObj: Status.boundStatus,
          value: '',
          placeholder: 'email.tip',
          operate: {
            bind: {
              text: 'bind',
              click: () => this.openModal('$bindEmail'),
            },
            toggleVerify: {
              text: ({ verifyOpened }) => (!verifyOpened ? 'verify.open' : 'verify.close'),
              click: (type, value) => this.toggleVerify(type, value),
            },
          },
        },
        {
          icon: 'icon-tubiaolunkuo-',
          name: 'password.fund',
          alias: 'withdraw_password_set',
          statusObj: Status.setStatus,
          placeholder: 'password.fund.tip',
          operate: {
            bind: {
              text: ({ status }) => (status === 'beenSet' ? 'reset' : 'set'),
              click: () => this.openModal('$setFundPassword'),
            },
            // toggleVerify: {
            //   text: ({ verifyOpened }) => (!verifyOpened ? 'verify.open' : 'verify.close'),
            //   click: (type, value) => this.toggleVerify(type, value),
            // },
          },
        },
        {
          icon: 'icon-iconset0284',
          name: 'verify.google',
          security: 'google',
          alias: 'two_step_set',
          statusObj: Status.boundStatus,
          placeholder: 'verify.google.tip',
          operate: {
            bind: {
              text: 'bind',
              click: () => this.openModal('$bindGoogleVerify'),
            },
            toggleVerify: {
              text: ({ verifyOpened }) => (!verifyOpened ? 'verify.open' : 'verify.close'),
              click: (type, value) => this.toggleVerify(type, value),
            },
          },
        },
        {
          icon: 'icon-shenfenzheng',
          name: 'user.certification',
          alias: 'identity_status',
          statusObj: Status.authorizeStatus,
          operate: {
            cer: {
              text: ({ status }) => {
                if (status === 'unauthorized') {
                  return 'authorize'
                }
                return 'details-1'
              },
              route: `${route}/certification`,
            },
          },
        },
        ...(this.siteInfo.c2cEnabled || this.siteInfo.otcEnabled ? [{
          icon: 'icon-tubiaolunkuo-',
          name: 'pay.set',
          alias: 'pay_bound_all',
          statusObj: Status.boundStatus,
          operate: {
            bind: {
              text: 'enter',
              route: `${route}/pay-set`,
            },
          },
        }] : []),
      ]
      return items.map(item => ({
        ...item,
        status: item.statusObj ? item.statusObj[this.user[item.alias] || 0].name : item.status,
        value: ['phone', 'email'].includes(item.name) ? this.user[item.name] : '',
        verifyOpened: !!this.security[item.security],
      }))
    },
    verifyItems() {
      return use_type => ([
        {
          name: 'verify.code.phone',
          alias: 'sms_code',
          needed: this.items[1].verifyOpened,
          value: '',
          preFormatter: verifyCodeNumber,
          validator: validateVerifyCode,
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode(use_type, 'phone'),
        },
        {
          name: 'verify.code.email',
          alias: 'email_code',
          needed: this.items[2].verifyOpened,
          value: '',
          preFormatter: verifyCodeNumber,
          validator: validateVerifyCode,
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode(use_type),
        },
        {
          name: 'verify.google',
          needed: this.items[4].verifyOpened,
          alias: 'two_step_code',
          value: '',
          preFormatter: verifyCodeNumber,
        },
      ])
    },
  },
  methods: {
    ...mapActions('user', ['getSecurity', 'verifyOpen', 'verifyClose', 'getLoginHistory', 'getCodeAfterLogin']),
    toggleVerify(type, value) {
      const val = value === 'open' ? 'open' : 'close';
      (val === 'open' ? this.verifyOpen(type) : new Promise((res, rej) => {
        if (type) {
          this.showOverlay = {
            res,
            rej,
            type,
            value,
            head: `verify.${val}`,
            items: this.verifyItems(type)
              .filter(item => item.needed),
          }
        }
      })).then(() => {
        this.snackBar.info(this.$t(`verify.${val}.success`))
        this.showOverlay = null
      }).catch((e) => {
        if (!e) {
          this.showOverlay = null
        }
      })
    },
    getCode(use_type, type) {
      let t = use_type === 'phone' ? 8 : 10
      t = use_type === 'email' ? 9 : t
      return this.getCodeAfterLogin({
        type: type === 'phone' ? '0' : '1',
        use_type: t,
      }).then(() => {
        this.snackBar.info(this.$t('verify.code.get.success'))
      })
    },
    close() {
      const { type, items, res } = this.showOverlay
      return this.validate(items)
        .then(() => this.verifyClose({ type, ...dataDeal(items) }).then(res))
        .catch(this.snackBar.error)
    },
    openModal(type) {
      this.$refs[type].open()
    },
  },
  beforeMount() {
    this.getSecurity().catch(this.snackBar.error)
    this.searching = true
    this.getLoginHistory({}).catch(this.snackBar.error).then(() => {
      this.searching = false
    })
  },
}
</script>
