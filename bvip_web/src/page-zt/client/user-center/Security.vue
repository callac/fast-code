<template>
  <page-container class="user-content security" :title="$t('user.security')">
    <!--<tab-head v-model="tab.value" :options="tab.options"/>-->
    <div class="assets-manager-title">{{$t('user.security')}}</div>
    <div class="level level-wrap">
      <p class="level-title">{{$t('user.account')}}</p>
      <!--<img class="img" :src="level.icon" alt="">-->
      <div class="user-info">
        <img :src="userContent" alt="">
        <span>{{user.username}}</span>
        <span :class="[user.identity_authenticated?'is-verify':'not-verify']">
          <i :class="[user.identity_authenticated
          ? 'icon-renzheng'
          : 'icon-weirenzheng', 'iconfont']"></i>
          {{user.identity_authenticated ? $t('authorized') : $t('unauthorized')}}
        </span>
      </div>
      <div class="userinfo-data">
        <div class="data-item">
          <p class="data-key">ID</p>
          <p class="data-value">{{user.id}}</p>
        </div>
        <div class="data-item">
          <p class="data-key">{{$t('security.level')}}</p>
          <p class="data-value">
            <span
              :class="[level.level === 1?
              'low-red':(level.level===2?
              'middle-yellow':(level.level ===3?'height-green':''))]"></span>
            <span
              :class="[level.level === 2?
              'middle-yellow':(level.level===3?
              'height-green':'')]"></span>
            <span
              :class="[level.level === 3?
              'height-green':'']"></span>
            <span :class="[level.level === 1?
              'low-red':(level.level===2?
              'middle-yellow':(level.level ===3?'height-green':'')),'grade-text']">
              {{level.level&&$t(Status.securityLevel[level.level].name)}}
            </span>
          </p>
        </div>
        <div class="data-item">
          <p class="data-key">{{$t('sign-in.last')}}</p>
          <p class="data-value">{{user.last_login|datePipe('')}}
            &nbsp;&nbsp;(IP: {{user.last_ip}})</p>
        </div>
      </div>
    </div>
    <div class="pwd-manage manage-item">
      <p class="level-title" @click="showItems">{{$t('security.passwords')}}</p>
      <div v-for="(item, i) in pwdManage" class="item" :key="i">
        <span
          :class="[item.status.indexOf('un')===0
          ? 'icon-cuowu error':'icon-zhengque right', 'iconfont']">
        </span>
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
              <router-link v-if="r.route" class="op" :key="i" :to="r.route">
                {{$t(typeof r.text === 'function'?r.text(item):r.text)}}
              </router-link>
              <button v-else-if="canClose||(!canClose&&!item.verifyOpened)"
                      class="op font-green" :key="i"
                      @click="r.click(item.security||item.name, item.verifyOpened?'close':'open')">
                {{$t(typeof r.text === 'function'?r.text(item):r.text)}}
              </button>
            </template>
          </template>
        </div>
      </div>
    </div>
    <div class="yanzheng-manage manage-item">
      <p class="level-title" @click="showItems">{{$t('security.multiple')}}</p>
      <div v-for="(item, i) in yanzhengManage" class="item" :key="i">
        <span
          :class="[item.status.indexOf('un')===0
          ? 'icon-cuowu error':'icon-zhengque right', 'iconfont']">
        </span>
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
              <router-link v-if="r.route" class="op" :key="i" :to="r.route">
                {{$t(typeof r.text === 'function'?r.text(item):r.text)}}
              </router-link>
              <a v-else-if="canClose||(!canClose&&!item.verifyOpened)"
                      class="op" :key="i"
                      @click="r.click(item.security||item.name, item.verifyOpened?'close':'open')">
                {{$t(typeof r.text === 'function'?r.text(item):r.text)}}
              </a>
            </template>
          </template>
        </div>
      </div>
    </div>
    <div class="renzheng-manage manage-item">
      <p class="level-title" @click="showItems">{{$t('security.authentication')}}</p>
      <div v-for="(item, i) in renZhengManage"
           class="item" style="position: relative; height: 0.9rem;" :key="i">
        <span
          :class="[item.status!=='authorized'
          ? 'icon-cuowu error':'icon-zhengque right', 'iconfont']">
        </span>
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
              <router-link v-if="r.route" class="op" :key="i" :to="r.route">
                {{$t(typeof r.text === 'function'?r.text(item):r.text)}}
              </router-link>
              <button v-else-if="canClose||(!canClose&&!item.verifyOpened)"
                      class="op font-green" :key="i"
                      @click="r.click(item.security||item.name, item.verifyOpened?'close':'open')">
                {{$t(typeof r.text === 'function'?r.text(item):r.text)}}
              </button>
              <p :key="i+1" class="tipT"
                    :style="{color: r.tipT(item) === 'submitted' ? '#F19A38' : '#E95F6B'}">
                {{$t(typeof r.text === 'function'?r.tipT(item):r.text)}}
              </p>
            </template>
          </template>
        </div>
      </div>
    </div>
    <div class="login-record manage-item">
      <!--<tab-head class="h2" v-model="history.value" :options="history.options"/>-->
      <p class="level-title" @click="showItems">{{this.$t(history.options[0].name)}}</p>
      <my-table :heads="loginHeads" :data="loginData" :sort="false" :searching="searching"/>
      <my-overlay v-if="showOverlay" @close="showOverlay.rej()" :head="$t(showOverlay.head)">
        <my-input v-for="(item,i) in showOverlay.items" type="1" :key="i" :item="item"
                  v-model="item.value"/>
        <p class="overlayTip">
          *{{$t('certification.closeTip')}}
          </p>
        <button class="submit btn-blue" @click="close">{{$t('submit')}}</button>
      </my-overlay>
    </div>
  </page-container>
</template>

<script>
import MyInput from 'components/client/MyInput'
import MyOverlay from 'components/client/MyOverlay'
// import TabHead from 'components/client/user-center/TabHead'
import Status from 'data/immutable-data/Status'
import { dataDeal } from 'utils/DataDeal'
import { verifyCodeNumber } from 'utils/InputFormatter'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'Security',
  beforeMount() {
    this.getSecurity().catch(this.snackBar.error)
    this.searching = true
    this.getLoginHistory({}).catch(this.snackBar.error).then(() => {
      this.searching = false
    })
  },
  data() {
    return {
      searching: false,
      tab: {
        value: '',
        options: [
          { name: 'user.security', value: '' },
        ],
      },
      showOverlay: null,
      Status,
      loginHeads: [
        { name: 'time', alias: 'time', style: { width: '25%' } },
        { name: 'IP', alias: 'ip', needTran: false },
        { name: 'login.type', alias: 'type' },
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
      const icons = {
        3: require('assets/client/user-center/icon_high.png'),
        2: require('assets/client/user-center/icon_middle.png'),
        1: require('assets/client/user-center/icon_low.png'),
      }
      return {
        icon: icons[level],
        level,
      }
    },
    userContent() {
      return require('assets/client/user-center/zt/user-content.png')
    },
    canClose() {
      return Object.keys(this.security).filter(k => this.security[k]).length > 1
    },
    items() {
      const route = this.$route.path
      const items = [
        {
          icon: 'icon-password_icon',
          name: 'login-password',
          alias: 'password',
          status: Status.setStatus[1].name,
          operate: {
            bind: {
              text: 'reset',
              route: `${route}/reset-password`,
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
              route: `${route}/set-password-fund`,
            },
            // toggleVerify: {
            //   text: ({ verifyOpened }) => (!verifyOpened ? 'verify.open' : 'verify.close'),
            //   click: (type, value) => this.toggleVerify(type, value),
            // },
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
              route: `${route}/bind-phone`,
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
              route: `${route}/bind-email`,
            },
            toggleVerify: {
              text: ({ verifyOpened }) => (!verifyOpened ? 'verify.open' : 'verify.close'),
              click: (type, value) => this.toggleVerify(type, value),
            },
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
              route: `${route}/bind-verify-google`,
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
              text: ({ status }) => { // 0审核状态暂无    1已提交    2审核通过    3审核失败     4审核中
                if (status === 'unauthorized') {
                  return 'authorize'
                } if (status === 'checking') {
                  return 'processing'
                } if (status === 'authorize.failed') {
                  return 'authorize.again'
                }
                return 'details-1'
              },
              route: `${route}/certification`,
              tipT: ({ status }) => {
                if (status === 'submitted') {
                  return 'submitted'
                } if (status === 'authorize.failed') {
                  return 'checked.not-passed'
                }
                return ''
              },
            },
          },
        },
        ...(this.siteInfo.c2cEnabled || this.siteInfo.otcEnabled ? [{
          icon: 'icon-tubiaolunkuo-',
          name: 'pay.set',
          alias: 'bank_card_bound',
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
    pwdManage() {
      return this.items.slice(0, 2)
    },
    yanzhengManage() {
      return this.items.slice(2, 5)
    },
    renZhengManage() {
      return this.items.slice(5, 6)
    },
    verifyItems() {
      return use_type => ([
        {
          name: 'verify.code.phone',
          alias: 'sms_code',
          needed: this.items[2].verifyOpened,
          value: '',
          preFormatter: verifyCodeNumber,
          btnText: 'verify.code.get',
          btnCodeFn: () => this.getCode(use_type, 'phone'),
        },
        {
          name: 'verify.code.email',
          alias: 'email_code',
          needed: this.items[3].verifyOpened,
          value: '',
          preFormatter: verifyCodeNumber,
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
    showItems() {
      console.log(this.items)
    },
  },
  components: { MyOverlay, MyInput },
}
</script>
