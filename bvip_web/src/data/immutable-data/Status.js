export default class Status {
  static checkStatus = Object.freeze({
    WAIT: { name: 'check.wait', value: 'WAIT' },
    PASS: { name: 'check.pass', value: 'PASS' },
    NOT_PASS: { name: 'check.not-pass', value: 'NOT_PASS' },
  })

  static assetOpStatus = Object.freeze({
    PROCESSING: { name: 'processing', value: 'PROCESSING' },
    CANCELED: { name: 'canceled', value: 'CANCELED' },
    COMPLETED: { name: 'completed-1', value: 'COMPLETED' },
  })

  static orderStatus = Object.freeze({
    BUYING: { name: 'buying', value: 'BUYING' },
    COMPLETED: { name: 'completed', value: 'COMPLETED' },
    CANCELED: { name: 'canceled', value: 'CANCELED' },
  })

  static orderType = Object.freeze({
    1: { name: 'sell-1', value: 1 },
    2: { name: 'buy-1', value: 2 },
  })

  static cashOrderType = Object.freeze({
    1: { name: 'buy-1', value: 1 },
    2: { name: 'sell-1', value: 2 },
  })

  static otcOrderType = Object.freeze({
    1: { name: 'buy-1', value: 1 },
    2: { name: 'sell-1', value: 2 },
  })

  static orderType1 = Object.freeze({
    1: { name: 'exchange.limit', value: 1 },
    2: { name: 'exchange.market', value: 2 },
  })

  static cashOrderStatus = Object.freeze({
    1: { name: 'pay.wait', value: 1 },
    2: { name: 'paid', aliasName: 'processing', value: 2 },
    3: { name: 'completed', value: 3 },
    4: { name: 'canceled', value: 4 },
    5: { name: 'checked.once', aliasName: 'processing', value: 5 },
  })

  static otcOrderStatus = Object.freeze({
    1: { name: 'pay.wait', value: 1 },
    2: { name: 'paid', value: 2 },
    3: { name: type => `otc.${type === 1 ? 'buy' : 'sell'}.checked`, value: 3 },
    4: { name: 'canceled', value: 4 },
    5: { name: 'processing', value: 5 },
    6: { name: 'expired', value: 6 },
    7: { name: 'completed', value: 7 },
    8: { name: 'un-completed', value: 8 },
  })

  static boundStatus = Object.freeze({
    1: { name: 'bound', value: 1 },
    0: { name: 'unbound', value: 0 },
  })

  static setStatus = Object.freeze({
    1: { name: 'beenSet', value: 1 },
    0: { name: 'unset', value: 0 },
  })

  static authorizeStatus = Object.freeze({
    0: { name: 'unauthorized', value: 0 },
    1: { name: 'submitted', value: 1 },
    2: { name: 'authorized', value: 2 },
    3: { name: 'authorize.failed', value: 3 },
    4: { name: 'checking', value: 4 },
  })

  static withdrawStatus = Object.freeze({
    // status = 5 是取消
    // status = 4 是失败
    // status = 1 是待审核
    // status = 2 是初审通过
    // wallet_status = 'DONE'和FailedNotRepeat是已完成
    '0': { name: 'submitted', value: 0 },
    '1': { name: 'processing', value: 1 },
    '2': { name: 'checked.once', value: 2 },
    '3': { name: 'success', value: 3 },
    '4': { name: 'failed', value: 4 },
    '5': { name: 'canceled', value: 5 },
    'DONE': { name: 'completed-1', value: 3 },
    'FailedNotRepeat': { name: 'completed-1', value: 3 },
    'INIT': { name: 'sent', value: 3 },
    'other': { name: 'confirmation', value: 3 },
  })

  static securityLevel = Object.freeze({
    1: { name: 'low', value: 1 },
    2: { name: 'middle', value: 2 },
    3: { name: 'high', value: 3 },
  })

  static payType = Object.freeze({
    '0': {
      name: 'bank.card',
      value: 'bank',
      icon: require('assets/client/exchange/icon-card.png'),
    },
  })

  static otcPayType = Object.freeze({
    '0': {
      name: 'bank.card',
      value: 'bank',
      icon: require('assets/client/exchange/icon-card.png'),
    },
    '1': {
      name: 'alipay',
      value: 'alipay_number',
      icon: require('assets/client/exchange/icon-alipay.png'),
    },
    '2': {
      name: 'wechatpay',
      value: 'wechat_number',
      icon: require('assets/client/exchange/icon-wechatpay.png'),
    },
  })

  static levels = Object.freeze({
    1: { name: '一级', value: 1 },
    2: { name: '二级', value: 2 },
    3: { name: '三级', value: 3 },
  })

  static footerItems = Object.freeze({
    1: { name: 'about-us', value: 1, alias: 'aboutUs' },
    2: { name: 'help-center', value: 2, alias: 'help' },
    3: { name: 'follow-us', value: 3, alias: 'followUs' },
    4: { name: 'friendly-links', value: 4, alias: 'friendlyLinks' },
  })

  static certificateImgTypes = Object.freeze({
    front: 0,
    inhand: 1,
    extraAustralia: 2,
  })

  static certificateTypes = Object.freeze({
    fast: 0,
    manual: 1,
  })

  // api管理列表状态
  static APIStatus = Object.freeze({
    // "status": "0正常，1禁用，2过期",
    0: { name: '正常', value: 0 },
    1: { name: '禁用', value: 1 },
    2: { name: '过期', value: 2 },
  })
}
