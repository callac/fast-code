/* eslint-disable max-len */
import * as config from 'config/config'
import { AuthToken } from 'data/api/auth-token'
import MarketSocket from 'data/api/market-socket'
import Status from 'data/immutable-data/Status'
import { Http } from 'extensions/http'

const url = (window.location.hostname === '47.111.138.2' || window.location.hostname === 'localhost') ? 'http://47.111.138.2:8889' : window.location.origin
// console.log(url)

const securities = [
  { name: 'email', type: 0 },
  { name: 'phone', type: 1 },
  { name: 'google', type: 2 },
]

function securitiesDeal(res) {
  const obj = {}
  securities.forEach((item) => {
    obj[item.name] = res.some(i => i.type === item.type)
  })
  return obj
}

function inviteC(i) {
  const rewards = {}
  const { awards } = i
  if (awards) {
    awards.forEach((item) => {
      const { award } = item
      if (award) {
        if (item.asset in rewards) {
          rewards[item.asset] += +award
        } else {
          rewards[item.asset] = +award
        }
      }
    })
  }
  return { ...i, levelName: i.level && Status.levels[i.level].name, rewards }
}

export default class User {
  static register({ username, password, code, password_confirmation, country_id = '', recommend_code = '' }) {
    return Http.postForm('/register', {
      username,
      password,
      code,
      password_confirmation,
      country_id,
      recommend_code,
    }).then((res) => {
      AuthToken.setToken(res)
      return res
    })
  }

  static getUser() {
    // 获取用户信息
    return Http.get('/user').then(user => ({
      ...user,
      phone1: user.phone,
      email1: user.email,
    }), (e) => {
      AuthToken.setToken('')
      throw e
    })
  }

  static signIn({ username, password }) {
    return Http.postForm('/login', { username, password }).then((res) => {
      AuthToken.setToken(res)
      return { ...res, securities: securitiesDeal(res.user_securities) }
    })
  }

  static safeLogin({ sms_code = '', email_code = '', two_step_code = '' }) {
    return Http.postForm('/user/safeLogin', { sms_code, email_code, two_step_code }).then((res) => {
      AuthToken.setToken(res)
      return res
    })
  }

  static signOut() {
    return new Promise((resolve) => {
      AuthToken.setToken('')
      MarketSocket.authorized = false
      resolve()
    })
  }

  static getCountries() {
    return Http.get('/country').then((res) => {
      if (res.length > 0) {
        const filter = ['中国', '香港', '台湾地区', '美国', '日本', '韩国', '英国', '德国', '澳大利亚']
        const f = filter.map(k => res.find(item => item.name_cn === k)).filter(item => item)
        const l = res.filter(item => !filter.includes(item.name_cn))
        return [...f, ...l]
      }
      return []
    })
  }

  /**
   * @param {String} username
   * @param {Number} use_type
   * 0, 注册, 默认
   * 1, 登录
   * 2, 忘记密码
   * 3, 创建两步验证
   * 4, 绑定手机
   * 5, 绑定邮箱
   * 6, 创建提币密码
   * 7, 提币
   * 8, 关闭手机验证
   * 9, 关闭邮箱验证
   * 10, 关闭两步验证
   * 11, 重置提币密码
   * 12, 绑定银行卡
   * 13, 重新绑定银行卡
   * 14, 添加提笔地址
   * @param {String|Number} id
   * @param {Number|String} img_code
   * @param {Number|String} country_id
   */
  static sendSms({ username, use_type = 0, id, img_code = '', country_id = '', validate_method = 0 }) {
    return Http.postForm('/SMS', { username, use_type, id, img_code, country_id, validate_method })
  }

  /**
   * @param {String} type
   * 0, 短信
   * 1，邮件
   * @param {Number} use_type
   * @param {Number|String} phone
   * @param {String} email
   * @param {Number|String} country_id
   * */
  static sendSmsAfterLogin({ type, use_type, phone = '', email = '', country_id = '' }) {
    return Http.postForm('/user/SMS', { type, use_type, phone, email, country_id })
  }

  static getImgCode() {
    return Http.get('/captcha/id').then(({ id }) => ({
      id,
      url: `${config.backendUrl}/captcha/${id}.png?reload=${new Date().getTime()}`,
    }))
  }

  static setCustomCoin(id) {
    return Http.post('/custom-coin', { id }).catch(e => console.log(e))
  }

  static delCustomCoin(id) {
    return Http.post('/custom-coin/del', { id }).catch(e => console.log(e))
  }

  static getCustomCoin() {
    return Http.get('/custom-coin').catch(e => console.log(e))
  }

  static getAssets() {
    return Http.get('/user/assets')
  }

  static getRechargeAddress(asset) {
    return Http.get('/user/rechargeAddress', { asset })
  }

  static getRechargeHistory({ asset, offset = 0, limit = 100 }) {
    return Http.get('/user/rechargeMoneyLog', { asset, offset, limit })
  }

  static resetPassword({ username, code, password, password_confirmation }) {
    return Http.postForm('/forgetPassword', {
      username,
      code,
      password,
      password_confirmation,
    })
  }

  static resetPasswordAfterLogin({ origin_password, password, password_confirmation }) {
    return Http.postForm('/user/resetPassword', {
      origin_password,
      password,
      password_confirmation,
    })
  }

  static bindPhone({ phone, sms_code = '', email_code = '', country_id = '', two_step_code = '' }) {
    return Http.postForm('/user/bindPhone', {
      phone,
      sms_code,
      email_code,
      country_id,
      two_step_code,
    })
  }

  static bindEmail({ email, sms_code = '', email_code = '', two_step_code = '' }) {
    return Http.postForm('/user/bindEmail', { email, sms_code, email_code, two_step_code })
  }

  static setFundPassword({ password, password_confirmation, sms_code = '', email_code = '', two_step_code = '' }) {
    return Http.postForm('/user/createWithdrawPassword', {
      password,
      password_confirmation,
      sms_code,
      email_code,
      two_step_code,
    })
  }

  // eslint-disable-next-line
  static resetFundPassword({ password, password_confirmation, sms_code = '', email_code = '', two_step_code = '' }) {
    return Http.postForm('/user/resetWithdrawPassword', {
      password,
      password_confirmation,
      sms_code,
      email_code,
      two_step_code,
    })
  }

  static getGoogleVerify() {
    return Http.get('/user/twoStepAuthKey')
  }

  static setGoogleVerify({ two_step_code = '', sms_code = '', email_code = '' }) {
    return Http.postForm('/user/twoStep', { two_step_code, sms_code, email_code })
  }

  static getSecurity() {
    return Http.get('/user/security').then(securitiesDeal)
  }

  static verifyOpen(type) {
    const t = securities.find(t1 => t1.name === type)
    return Http.postForm('/user/reopen', { type: t && t.type })
  }

  static verifyClose({ type, sms_code = '', email_code = '', two_step_code = '' }) {
    const t = [
      { name: 'email', route: '/user/closeEmail', type: 0 },
      { name: 'phone', route: '/user/closePhone', type: 1 },
      { name: 'google', route: '/user/closeTwoStep', type: 2 },
    ].find(t1 => t1.name === type)
    return Http.postForm(t.route, { sms_code, email_code, two_step_code })
  }

  static getWithdrawAddresses({ asset = null, offset = 0, limit = 100 }) {
    return Http.get('/user/withdrawAddress', { asset, offset, limit })
      .then(res => ({
        ...res,
        records: res.records.map((ad) => {
          const arr = ad.address.split(':')
          return { ...ad, address: arr[0], memo: arr[1] || '' }
        }),
      }))
  }

  static addWithdrawAddress({ asset, name, address, remark = '', memo = '', sms_code, email_code, two_step_code }) {
    return Http.postForm('/user/withdrawAddress', {
      asset,
      name,
      address,
      remark,
      memo,
      sms_code,
      email_code,
      two_step_code,
    })
  }

  static delWithdrawAddress(id) {
    return Http.postForm('/user/deleteWithdrawAddress', { id })
  }

  static withdraw({ asset, address_id, amount, password, sms_code = '', email_code = '', two_step_code = '', address = '', memo = '' }) {
    return Http.postForm('/user/withdraw', {
      asset,
      address_id,
      amount,
      password,
      sms_code,
      email_code,
      two_step_code,
      address,
      memo,
    })
  }

  static commonAddress({ id, remark }) {
    return Http.postForm('/user/commonAddress', {
      id, // 提现返回的id
      remark, // 备注
    })
  }

  static getWithdrawRecords({ asset, offset = 0, limit = 10 }) {
    return Http.get('/user/withdrawMoneyLog', { asset, offset, limit })
  }

  static withdrawCancel(id) {
    return Http.postForm('/user/withdraw/cancel', { id })
  }

  static getCertificationUrl({ country_id, first_name, last_name, number }) {
    return Http.postForm('/user/identity', { country_id, first_name, last_name, number })
  }

  static getLoginHistory({ offset = 0, limit = 10 }) {
    return Http.get('/user/loginLog', { offset, limit })
  }

  static getCard() {
    return Http.get('/user/bank').then(res => res.map(item => ({
      ...item,
      bank_name: item.bank,
      sub_bank_name: item.sub_bank,
      number: item.card_number,
    })))
  }

  static setCard({ bank_name, sub_bank_name, number, pre_phone, sms_code, email_code, two_step_code }) {
    return Http.postForm('/user/bank', {
      bank_name,
      sub_bank_name,
      number,
      pre_phone,
      sms_code,
      email_code,
      two_step_code,
    })
  }

  static delCard(id) {
    return Http.postForm('user/deleteBank', { id })
  }

  static getInviteData() {
    return Http.get(`${url}/api/activity/invite_commission_activity/recommend`).then(res => ({
      ...res,
    }))
  }

  static getInviteRecords({ offset = 0, limit = 10 }) {
    return Http.get('/user/recommend/log', { offset, limit }).then(res => ({
      ...res,
      recordsC: res.records && res.records.map(inviteC),
    }))
  }

  static getRebaseRecords({ offset = 0, limit = 10 }) {
    return Http.get(`${url}/api/activity/invite_commission_activity/recommend/commission/log`, { offset, limit }).then(res => ({
      ...res,
      // recordsC: res.records && res.records.map(inviteC),
    }))
  }

  static getInvite() {
    return Http.get('/user/recommend').then(res => ({ ...res, ...inviteC(res) }))
  }

  static getTokenHistory({ asset = '', business = '', start_time = 0, end_time = 0, offset, limit }) {
    return Http.post('/user/balance/history', {
      asset,
      business,
      start_time,
      end_time,
      offset,
      limit,
    })
  }

  static getBusinessType() {
    return Http.get('/business')
      .then(res => Object.keys(res).map(k => ({ name: res[k], value: k })))
  }

  static getCertificateInfo() {
    return Http.get('/user/identity').then(res => ({
      ...res,
      ...res.info,
      statusName: Status.authorizeStatus[res.info.status].name,
    }))
  }

  static updateCertificateInfo({ id, last_name, first_name, country_id, number }) {
    return Http.postForm('/user/updateIdentity', { id, last_name, first_name, country_id, number })
  }

  static getOssConfig() {
    return Http.get('/user/oss/auth')
  }

  /**
   * @param {String} identity_id
   * @param {String} filename
   * @param {Integer} img_type, options: Status.certificateImgTypes
   * */
  static uploadCertificateImg({ identity_id, filename, img_type = 0 }) {
    return Http.postForm('/user/uploadImage', { identity_id, filename, img_type })
  }

  static certificateSubmitAll(id) {
    return Http.postForm('/user/confirmIdentity', { id })
  }

  static getMyOtcPayTypes() {
    return Http.get('user/otc/mobilePay')
      .then(({ logs = [], banks = [] }) => ([...logs, ...banks].map(item => ({
        ...item,
        name: `<img class="icon-pay" src="${Status.otcPayType[item.status || 0].icon}">
               ${item.bank || item.name}${item.sub_bank ? `(${item.sub_bank})` : ''}
               ${item.card_number ? `...${item.card_number.slice(item.card_number.length - 4)}` : item.account}`,
        value: `${item.status || 0}_${item.id || item.ID}`,
      }))))
  }

  static transferToOtc({ asset, amount, withdraw_password }) {
    return Http.postForm('user/otc/transferOut', { asset, amount, withdraw_password })
  }

  static addMobilePay({ name, account, filename, status, sms_code, email_code, two_step_code }) {
    return Http.postForm('user/otc/addMobilePay', {
      name,
      account,
      filename,
      status,
      sms_code,
      email_code,
      two_step_code,
    })
  }

  static delMobilePay(id) {
    return Http.postForm('user/otc/deletePay', { id })
  }

  static checkUser() {
    // 验证是否有otc账户
    return Http.getOTC('/user/check')
  }

  static getCustom() {
    return Http.get('user/symbol')
  }

  static setCustom(symbol_id) {
    return Http.post('user/setSymbol', { symbol_id })
  }

  static dleCustom(symbol_id) {
    return Http.post('user/delSymbol', { symbol_id })
  }

  static sycCustom(symbol_id) {
    return Http.post('user/syncSymbol', { symbol_id })
  }

  // api列表
  static getApi() {
    return Http.get('user/api')
  }

  // 创建api
  // remark:备注
  // bind_ips:绑定ip
  // sms_code:短信验证码
  // email_code:邮件验证码
  // two_step_code:谷歌两步验证码
  static createApi({ remark = '', bind_ips = '', sms_code = '', email_code = '', two_step_code = '' }) {
    return Http.post('user/api', { remark, bind_ips, sms_code, email_code, two_step_code })
  }

  // 更新api
  // user_app_id:api编号
  // remark:备注
  // bind_ips:绑定ip
  static updateApi({ user_app_id, remark, bind_ips }) {
    return Http.post('user/updateApi', { user_app_id, remark, bind_ips })
  }

  // 删除api
  // user_app_id:用户api编号
  static deleteApi({ user_app_id }) {
    return Http.post('user/deleteApi', { user_app_id })
  }
}
