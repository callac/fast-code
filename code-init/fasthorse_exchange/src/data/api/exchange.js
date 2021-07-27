import Status from 'data/immutable-data/Status'
import { Http } from 'extensions/http'

export default class Exchange {
  static getExchangeRate() {
    return Http.get('/currency')
  }

  /**
   * @param {String} market
   * @param {String} side
   * '1' 卖出
   * '2' 买入
   * @param {String} amount
   * @param {String} price
   * */
  static tradeLimit({ market, side = '1', amount = '0', price = '1' }) {
    return Http.postForm('/user/trade/limit', { market, side, amount, price })
  }

  static tradeByMarket({ market, side = '1', amount = '0' }) {
    return Http.postForm('/user/trade/market', { market, side, amount })
  }

  static tradeCancel({ market, order_id }) {
    return Http.postForm('/user/trade/cancel', { market, order_id })
  }

  static openOrderList({ market, offset = 0, limit = 10 }) {
    return Http.postForm('/user/order/pending', { market, offset, limit })
  }

  static openOrderDetails({ market, order_id }) {
    return Http.get('/user/order/pending/detail', { market, order_id })
  }

  // eslint-disable-next-line
  static orderFinishedList({ market, start_time = 0, end_time = 0, offset = 0, limit = 10, side = 0 }) {
    return Http.postForm('/user/order/finished', {
      market,
      start_time,
      end_time,
      offset,
      limit,
      side,
    })
  }

  static orderReferences({ order_id, offset = 0, limit = 100 }) {
    return Http.postForm('/user/order/deals', { order_id, offset, limit })
  }

  static finishedOrderDetails({ market, order_id }) {
    return Http.get('/user/order/finished/detail', { market, order_id })
  }

  static getCashPrice() {
    return Http.get('/c2cPrice')
  }

  /**
   * @param {Number} type
   * 1, buy
   * 2, sell
   * @param {Number} amount
   * @param {String} user_bank_id
   * */
  static exchangeCash({ amount, type = 1, user_bank_id = '' }) {
    return Http.postForm('/user/c2c/trade', { amount, type, user_bank_id })
  }

  /**
   * @param {Number} status
   * 1, 未支付
   * 2, 已支付
   * 3, 已取消
   * @param {Number} offset
   * @param {Number} limit
   * */
  static getCashOrderHistory({ status, offset = 0, limit = 10 }) {
    return Http.get('/user/c2c/trade', { status, offset, limit })
      .then(res => res.map(item => ({ ...item, coin: item.asset })))
  }

  /**
   * @param {String} id
   * @param {String} action
   * cancel, 取消订单   默认
   * confirm, 确认订单（已支付）
   * */
  static updateCashOrder({ id, action = 'cancel' }) {
    return Http.postForm('/user/c2c/updateTrade', { id, action })
  }

  static getOtcMerchants({ asset, currency, type, payMethod, offset = 0, limit = 10 }) {
    return Http.get('otc/getMerchant', { asset, currency, type, payMethod, offset, limit })
      .then(({ total = 0, logs = [] }) => ({
        total,
        records: logs.map(item => ({
          asset,
          currency,
          ...item,
          id: item.merchant_account_id,
          payType: item.pay_method.split(',').map(v => Status.otcPayType[v]).filter(v => v),
          limit: `${item.limit_money_lower}~${item.limit_money_higher} <span class="unit">${asset}</span>`,
          assetCount: `${item.amount} <span class="unit">${asset}</span>`,
          assetAmount: `${item.total_amount} <span class="unit">${currency}</span>`,
          priceC: `${item.price} <span class="unit">${currency}</span>`,
        })),
      }))
  }

  static getMyOtcOrders({ asset, currency, offset = 0, limit = 10, status = '' }) {
    return Http.get('user/otc/trade', { asset, currency, status, offset, limit })
      .then(({ total = 0, logs = [] }) => ({
        total,
        records: logs.map(item => ({
          ...item,
          asset,
          currency,
          id: item.order_no,
          priceC: `${item.price} <span class="unit">${currency}</span>`,
          countC: `${item.amount} <span class="unit">${asset}</span>`,
          amountC: `${item.total_amount} <span class="unit">${currency}</span>`,
          merchantName: item.name,
          createdAt: item.create_time,
          expireTime: item.expire_time,
          payType: item.pay_method.split(',').map(v => Status.otcPayType[v]).filter(v => v),
          statusObj: {
            ...Status.otcOrderStatus[item.status],
            name: (() => {
              const name = Status.otcOrderStatus[item.status]
                && Status.otcOrderStatus[item.status].name
              return name instanceof Function ? name(item.type) : name
            })(),
          },
        })),
      }))
  }

  static getOtcMerchantPayTypes(order_no) {
    return Http.post('user/otc/merchantAccount', { order_no })
      .then(res => ({
        ...res,
        payTypes: (res.account || []).map(item => ({
          ...item,
          type: +item.pay_method,
          name: item.pay_method_name,
          subName: item.pay_method_sub_name,
          value: item.pay_method_no,
        })),
      }))
  }

  static getOtcOrderDetails(id) {
    return Http.get('user/otc/detail', { orderNo: id })
      .then((res) => {
        let pro
        if (+res.type === 1 && res.status === Status.otcOrderStatus[1].value) {
          pro = Exchange.getOtcMerchantPayTypes(res.order_no)
            .then(({ payTypes }) => payTypes)
        } else {
          pro = Promise.resolve(res.pay_method !== '' ? [
            {
              type: +res.pay_method,
              name: res.pay_method_name,
              subName: res.pay_method_sub_name,
              value: res.pay_method_no,
            },
          ] : [])
        }
        return pro.then(merchantPayTypes => ({
          ...res,
          id: res.order_no,
          asset: res.otc_asset,
          currency: res.otc_currency,
          priceC: `${res.price} <span. class="unit">${res.otc_currency}</span>`,
          countC: `${res.amount} <span class="unit">${res.otc_asset}</span>`,
          amountC: `${res.total_amount} <span class="unit">${res.otc_currency}</span>`,
          merchantName: res.name,
          merchantPhone: res.phone,
          createdAt: res.create_time,
          expireTime: res.expire_time,
          statusObj: {
            ...Status.otcOrderStatus[res.status],
            name: (() => {
              const name = Status.otcOrderStatus[res.status]
                && Status.otcOrderStatus[res.status].name
              return name instanceof Function ? name(res.type) : name
            })(),
          },
          merchantPayTypes,
        }))
      })
  }

  static getOtcPrice({ asset, currency = 'CNY' }) {
    return Http.get('otc/getPrice', { asset, currency })
      .then((price) => {
        const c = price.otc_currency || currency
        return {
          ...price,
          asset: price.otc_asset || asset,
          currency: c,
          last: `${price.latest_price || 0}`,
          high: `${price.highest_price || price.latest_price || 0}`,
          low: `${price.lowest_price || 0}`,
          rateC: (+price.rate || 0).toFixed(2),
        }
      })
  }

  static exchangeOtc({ merchant_account_id, count, type, payType, withdraw_password }) {
    const [pay_method, pay_method_id] = payType.split('_')
    return Http.postForm('user/otc/trade', {
      amount: count,
      type,
      merchant_account_id,
      withdraw_password,
      pay_method,
      pay_method_id,
    }).then(res => ({
      ...res,
      ...res.order,
    }))
  }

  static otcUpdate({ order_no, action, pay_method = '', pay_method_id = '' }) {
    return Http.postForm('user/otc/update', { order_no, action, pay_method, pay_method_id })
  }
}
