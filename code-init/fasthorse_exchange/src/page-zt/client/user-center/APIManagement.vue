<template>
  <page-container class="user-content api-managenment" :title="$t('api.manager')">
    <div class="assets-manager-title">{{$t('api.manager')}}</div>
    <div class="my-capital">
      <p class="capital-title">{{$t('api.manager.create')}}</p>
      <div class="convert">
        <div class="create-api-form">
          <my-input v-for="(item, index) in showItems"
                    v-model="item.value"
                    :key="index" type="1"
                    :item="item"/>
          <div class="api-ip-address">{{$t('api.key.tips', { day: expire_time})}}</div>
          <div class="bottom">
            <btn-once class="btn-green-fill submit" :clickFn="submit">
              {{$t('api.immediately.create')}}
            </btn-once>
          </div>
        </div>
        <div class="api-tips">
          <h3>{{$t('tips')}}：</h3>
          <p>{{$t('api.tips.desc1')}}</p>
          <p>{{$t('api.tips.desc2',{IP:apiConfig.api_max_bind})}}</p>
          <p>{{$t('api.tips.desc3',{IP:apiConfig.api_max_ip_bind})}}</p>
        </div>
      </div>
    </div>
    <div class="api-record">
      <div class="api-title">{{$t('api.my.key')}}</div>
      <my-table :class="{'no-data': apiRecords&&apiRecords.length<1}"
                :heads="heads" :data="apiRecords" :sort="false">
        <template v-for="(r,i) in apiRecords" :slot="i+'-6'">
          <div :key="i">
            <button class="btn-blue" v-if="r.status === 0" @click="showEdit(r)">
              {{$t('api.edit.btn')}}
            </button>
            <button class="btn-red" v-if="r.status !== 1" @click="showDel(r)">
              {{$t('del')}}
            </button>
          </div>
        </template>
      </my-table>
    </div>
    <!--编辑api-->
    <overlay class="my-overlay" v-if="dialog === 'update'">
      <div class="window">
        <div class="content-wrap">
          <div class="overlay-header">
            <span class="icon">
              <img :src="require('assets/tip-icon.png')"/>
            </span>
            <span class="title">{{$t('api.edit')}}</span>
          </div>
          <div class="overlay-body">
            <div class="safety-cell">
              <div class="label">{{$t('remark')}}</div>
              <div class="input-content">
                <input v-model="actionItem.remark" :placeholder="$t('api.remark')" type="text"/>
              </div>
            </div>
            <div class="safety-cell">
              <div class="label">{{$t('api.bind.address')}}</div>
              <div class="input-content">
                <textarea v-model="actionItem.bind_ips" :placeholder="$t('api.please.address')">
                </textarea>
              </div>
            </div>
          </div>
          <div class="overlay-footer">
            <div class="btn cancel-btn" @click="dialog = null">{{$t('cancel-1')}}</div>
            <div class="btn enter-btn" @click="doEdit">{{$t('sure')}}</div>
          </div>
        </div>
      </div>
    </overlay>
    <!--删除api-->
    <overlay class="my-overlay" v-if="dialog === 'del'">
      <div class="window">
        <div class="content-wrap">
          <div class="overlay-header">
            <span class="icon">
              <img :src="require('assets/tip-icon.png')"/>
            </span>
            <span class="title">{{$t('tip')}}</span>
          </div>
          <div class="overlay-body">
            <div class="del-tips">{{$t('api.sure.del')}}</div>
          </div>
          <div class="overlay-footer">
            <div class="btn enter-btn" @click="dialog = null">{{$t('cancel-1')}}</div>
            <div class="btn cancel-btn" @click="doDel">{{$t('sure')}}</div>
          </div>
        </div>
      </div>
    </overlay>
    <!--安全验证-->
    <overlay class="my-overlay" v-if="dialog === 'safety'">
      <div class="window">
        <div class="content-wrap">
          <div class="overlay-header">
            <span class="icon">
              <img :src="require('assets/tip-icon.png')"/>
            </span>
            <span class="title">{{$t('verify.security')}}</span>
          </div>
          <div class="overlay-body">
            <template v-for="(item,index) in safetyItems">
              <div class="safety-cell" v-if="item.verifyOpened" :key="index">
                <div class="label">{{item.label}}</div>
                <div class="input-content">
                  <input v-model="item.value" :placeholder="$t(item.placeholder)" type="text"/>
                  <btn-code v-if="item.btnCodeFn" :class="{btn:true}"
                            :getCodeFn="item.btnCodeFn"
                            @errorGet="$emit('errorGet',$event)" @error="$emit('error', $event)"/>
                </div>
              </div>
            </template>
          </div>
          <div class="overlay-footer" style="padding-top: 0.2rem">
            <div class="btn cancel-btn" @click="dialog = null">{{$t('cancel-1')}}</div>
            <div class="btn enter-btn" @click="doCreateApi">{{$t('sure')}}</div>
          </div>
        </div>
      </div>
    </overlay>
    <!--创建成功-->
    <overlay class="my-overlay" v-if="dialog === 'create'">
      <div class="window">
        <div class="content-wrap">
          <div class="overlay-header">
            <span class="icon">
              <img :src="require('assets/tip-icon.png')"/>
            </span>
            <span class="title">{{$t('api.create.success')}}</span>
          </div>
          <div class="overlay-body">
            <div class="safety-cell">
              <div class="label">Access Key</div>
              <div class="input-content">
                <input :value="actionItem.api_key" type="text" readonly/>
                <button class="copy" @click="copy(actionItem.api_key)">{{$t('copy')}}</button>
              </div>
            </div>
            <div class="safety-cell">
              <div class="label">
                Secret Key
                <span class="red-tips">{{$t('api.safekeeping')}}</span>
              </div>
              <div class="input-content">
                <input :value="actionItem.secret_key" type="text" readonly/>
                <button class="copy" @click="copy(actionItem.secret_key)">{{$t('copy')}}</button>
              </div>
            </div>
            <div class="safety-cell">
              <div class="label">{{$t('api.bind.address')}}</div>
              <div class="input-content">
                <input :value="actionItem.bind_ips ? actionItem.bind_ips : $t('api.not.bind')"
                       type="text" readonly/>
              </div>
            </div>
            <div class="create-success-tips">
              <div class="icon">
                <i class="iconfont font_family icon-tanhao"></i>
              </div>
              <div class="text">
                {{$t('api.cat.out')}}
              </div>
            </div>
          </div>
          <div class="overlay-footer">
            <div class="btn enter-btn" @click="dialog = null">{{$t('sure')}}</div>
          </div>
        </div>
      </div>
    </overlay>
    <overlay-confirm v-if="showOverlay"
                     :tipText="$t('unauthorized.tip')"
                     :confirmText="$t('authorize')"
                     @close="showOverlay.rej()"
                     @cancel="showOverlay.rej()"
                     @confirm="$router.push('/user-center/security/certification')"/>
  </page-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import MyInput from 'components/client/MyInput'
import BtnCode from 'components/common/BtnCode'
import Status from 'data/immutable-data/Status'
import { dataDeal } from 'utils/DataDeal'
import { copyText, strTrimAll } from 'utils/Utils'
import { validateIp, validateVerifyCode, validateRemark } from 'utils/FormValidate'

export default {
  name: 'AssetsManage',
  created() {
    this.loadApi();
  },
  data() {
    return {
      items: [
        {
          name: 'remark',
          alias: 'remark',
          placeholder: 'api.remark',
          value: '',
          validator: validateRemark,
          preFormatter: strTrimAll,
        },
        {
          name: 'api.bind.address.label',
          alias: 'bind_ips',
          placeholder: 'api.please.address',
          value: '',
          inputType: 'textarea',
          required: false,
          validator: validateIp,
          preFormatter: strTrimAll,
        },
      ],
      showOverlay: null, // 实名认证
      apiRecords: [],
      heads: [
        { name: 'createdAt',
          alias: 'created_at',
          style: { textAlign: 'center' },
          formatter: item => this.dateFormatter(item.created_at, 'YYYY-MM-DD HH:mm:ss') },
        { name: 'remark', alias: 'remark', style: { textAlign: 'center', width: '15%' } },
        { name: 'api.access.key', alias: 'api_key', style: { textAlign: 'center' } },
        { name: 'api.bind.address',
          alias: 'bind_ips',
          style: { textAlign: 'center' },
          formatter: item => `<div class="bind_ips">${item.bind_ips ? item.bind_ips : '--'}</div>` },
        { name: 'api.remaining.period',
          alias: 'expire_left',
          style: { textAlign: 'center' },
          formatter: item => (item.bind_ips ? this.$t('api.left.time') : this.dateFormatDay(item.expire_left)) },
        { name: 'status', alias: 'statusName', style: { textAlign: 'center' } },
        { name: 'action', style: { textAlign: 'center' } },
      ],
      dialog: null,
      loadState: false,
      actionItem: {
        user_app_id: '',
        remark: '',
        bind_ips: '',
      }, // 操作数据
      apiConfig: {
        api_expire_time: 0,
        api_max_bind: 0,
        api_max_ip_bind: 0,
      },
    }
  },
  computed: {
    ...mapState('user', {
      user: state => state.info,
    }),
    expire_time() {
      return parseInt(this.apiConfig.api_expire_time / (60 * 60 * 24), 8)
    },
    showItems() {
      return this.items ? this.items : []
    },
    safetyItems() {
      const items = [
        {
          name: 'verify.code.email',
          label: 'email',
          security: 'email_bound',
          alias: 'email_code',
          statusObj: Status.boundStatus,
          btnCodeFn: () => this.getSms('email'),
          validator: validateVerifyCode,
          value: '',
          placeholder: 'api.email.placeholder',
        },
        {
          name: 'verify.code.message',
          label: 'phone',
          security: 'phone_bound',
          alias: 'sms_code',
          statusObj: Status.boundStatus,
          btnCodeFn: () => this.getSms('phone'),
          value: '',
          validator: validateVerifyCode,
          placeholder: 'api.phone.placeholder',
        },
        {
          name: 'verify.code.google',
          label: 'verify.google',
          security: 'two_step_set',
          alias: 'two_step_code',
          validator: validateVerifyCode,
          statusObj: Status.boundStatus,
          placeholder: 'api.google.placeholder',
        },
      ]
      return items.map(item => ({
        ...item,
        status: item.statusObj ? item.statusObj[this.user[item.alias] || 0].name : item.status,
        label: ['phone', 'email'].includes(item.label) ? this.$t(item.label) + this.user[item.label] : this.$t(item.label),
        verifyOpened: this.user[item.security] === 1,
      }))
    },
  },
  methods: {
    ...mapActions('user', ['getApi', 'createApi', 'updateApi', 'deleteApi', 'getCodeAfterLogin']),
    // 剩余多少时间过期
    dateFormatDay(time) {
      /* eslint-disable */
      const day = parseInt(time / (60 * 60 * 24))
      if (day > 0) {
        return day + this.$t('day')
      }
      const hour = parseInt(time / (60 * 60))
      let min = 0
      if (hour >= 1) {
        min = parseInt((time - 3600 * hour) / 60)
        return hour + this.$t('hour') + min + this.$t('minute')
      }
      min = parseInt(time / 60)
      if(min<0){
        return 0
      }
      return min + this.$t('minute')
    },
    // 获取列表
    loadApi() {
      this.getApi().then((res) => {
        const data = res.records ? res.records : []
        data.map((item) => {
          item.statusName = Status.APIStatus[item.status].name
          return item
        })
        this.apiRecords = data
        this.apiConfig = res.config
      }).catch(this.snackBar.error)
    },
    // 点击创建api
    submit() {
      // 判断是否需要填写资金密码，是否实名认证
      if (!this.user.identity_authenticated) {
        return new Promise((res, rej) => {
          this.showOverlay = { res, rej }
        }).catch((e) => {
          if (!e) this.showOverlay = null
        })
      }
      if(this.showItems[0].value ===''){
        return Promise.reject(new Error(this.$t(this.showItems[0].placeholder)))
      }
      if(!validateRemark(this.showItems[0].value)){
        return Promise.reject(new Error(this.$t('api.wrong.remark')))
      }
      return this.validate(this.showItems).then(() => {
        const IPsLength = String(this.showItems[1].value).split(',').length
        if (this.apiRecords.length >= this.apiConfig.api_max_bind) {
          this.snackBar.error(this.$t('api.more.tips', { IP: this.apiConfig.api_max_bind }))
        } else if (IPsLength > Number(this.apiConfig.api_max_ip_bind)) {
          this.snackBar.error(this.$t('api.more', { IP: this.apiConfig.api_max_ip_bind }))
        } else {
          this.dialog = 'safety'
        }
      })
    },
    // 创建api
    doCreateApi() {
      if (this.loadState) {
        return false
      }
      const items = this.safetyItems.filter(item => item.verifyOpened === true)
      let wrong = false
      let index = 0
      items.forEach((item,i)=>{
        if(item.value === ''){
          index = i>index ? index : i
          wrong = true
        }
      })
      if(wrong){
        this.snackBar.error(this.$t(items[index].placeholder))
        return false
      }
      return this.validate(items).then(() => {
        this.loadState = true
        this.createApi({
          ...dataDeal(this.showItems),
          ...dataDeal(items),
        }).then((res) => {
          this.loadState = false
          this.actionItem = res
          this.dialog = 'create'
          this.loadApi()
        }).catch((rej) => {
          this.snackBar.error(rej)
          this.loadState = false
        })
      }).catch(this.snackBar.error)
    },
    // 编辑api弹窗
    showEdit(item) {
      const actionItem = JSON.stringify(item)
      this.actionItem = JSON.parse(actionItem)
      this.dialog = 'update'
    },
    // 编辑api操作
    doEdit() {
      if (this.actionItem.remark === '') {
        this.snackBar.error(`${this.$t('api.remark')}`)
      } else if (this.actionItem.bind_ips !== '' && !validateIp(this.actionItem.bind_ips)) {
        this.snackBar.error(`${this.$t('api.bind.address')} ：${this.$t('invalid')}`)
      } else if (!this.loadState) {
        const IPsLength = String(this.actionItem.bind_ips).split(',').length
        if (IPsLength > this.apiConfig.api_max_ip_bind) {
          this.snackBar.error(this.$t('api.more', { IP: this.apiConfig.api_max_ip_bind }))
        } else {
          this.loadState = true
          this.updateApi({ ...this.actionItem, user_app_id: this.actionItem.id }).then(() => {
            this.dialog = null
            this.loadState = false
            this.snackBar.info(this.$t('edit.success'))
            this.loadApi()
          }).catch((rej) => {
            this.snackBar.error(rej)
            this.loadState = false
          })
        }
      }
    },
    // 删除api弹窗
    showDel(item) {
      this.actionItem = item
      this.dialog = 'del'
    },
    // 删除api操作
    doDel() {
      if (!this.loadState) {
        this.loadState = true
        this.deleteApi({ user_app_id: this.actionItem.id }).then(() => {
          this.dialog = null
          this.loadState = false
          this.snackBar.info(this.$t('del.success'))
          this.loadApi()
        }).catch((rej) => {
          this.snackBar.error(rej)
          this.loadState = false
        })
      }
    },
    // 复制
    copy(text) {
      copyText(text)
        .then(val => this.snackBar.info(this.$t(val)))
        .catch(e => this.snackBar.error(this.$t(e)))
    },
    // 发送验证码
    getSms(alias) {
      const type = alias === 'phone' ? '0' : '1'
      return this.getCodeAfterLogin({
        type,
        use_type: 18,
      }).then(() => {
        this.snackBar.info(this.$t('verify.code.get.success'))
      }).catch(this.snackBar.error)
    },
  },
  components: { MyInput, BtnCode },
}
</script>
