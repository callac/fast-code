/* eslint-disable no-param-reassign */
import { Observer } from '@livelybone/simple-observer'
import { AuthToken } from 'data/api/auth-token'
import Status from 'data/immutable-data/Status'
import { KlineSocket, Socket } from 'extensions/socket'
import { calcRate, objNumDeal } from 'utils/DataDeal'
import { dealNumStringForObj, msToS, toNumNotExponential } from 'utils/Utils'

function status(d) {
  const { deal_stock, deal_money, amount, type } = d
  let s = Status.orderStatus.BUYING.value
  if (+type === 2) {
    s = Status.orderStatus.COMPLETED.value
  } else if (+deal_stock - +amount >= -1e-8) {
    s = Status.orderStatus.COMPLETED.value
  } else if (!+deal_money || !+deal_stock) {
    s = Status.orderStatus.CANCELED.value
  }
  return s
}

function klineData(item) {
  return [
    item[0] * 1000,
    +item[1],
    +item[3],
    +item[4],
    +item[2],
    ...item.slice(5).map(val => (Number.isNaN(+val) ? val : +val)),
  ]
}

export default class MarketSocket {
  static Auth() {
    return (MarketSocket.authorized ? Promise.resolve() : Socket.request({
      method: 'server.auth',
      params: [AuthToken.getToken(), '/'],
    })).then(() => {
      if (!MarketSocket.authorized) console.log('---- MarketSocket: Authorization success')
      MarketSocket.authorized = true
    }, (e) => {
      console.error('---- MarketSocket: Authorization failed', e)
      throw e
    })
  }

  static marketToday(symbols) {
    return new Observer((next) => {
      Socket.subscribe({
        method: 'today.subscribe',
        getResultMethod: 'today.update',
        params: symbols,
        callback: pro => pro.then((data) => {
          next({
            symbol: data[0],
            ...dealNumStringForObj(data[1]),
            rate: calcRate(data[1].last, data[1].open),
          })
        }),
      })
    })
  }

  static marketTodayUnsubscribe() {
    Socket.unsubscribe('today.unsubscribe')
  }

  /**
   * kline订阅历史数据
   * */
  static klineQuery({ market, limit = 1000, start, end, interval }) {
    const start1 = start || (end - Math.max(0, limit - 1) * interval)
    return KlineSocket.request({
      method: 'kline.query',
      params: [market, msToS(start1), msToS(end), msToS(interval)],
    }).then(res => res.map(klineData))
  }

  /**
   * kline订阅实时数据更新
   * */
  static klineUpdate({ market, interval }) {
    return new Observer((next) => {
      KlineSocket.subscribe({
        method: 'kline.subscribe',
        getResultMethod: 'kline.update',
        params: [market, msToS(interval)],
        callback: pro => pro.then((data) => {
          next(data.map(klineData))
        }),
      })
    })
  }

  static klineUnsubscribe() {
    KlineSocket.unsubscribe('kline.unsubscribe')
  }

  /**
   * 交易
   * */
  static dealsQuery({ symbol, limit = 30, last_id = 0 }) {
    return KlineSocket.request({
      method: 'deals.query',
      params: [symbol, limit, last_id],
    })
  }

  static dealsSubscribe(symbols) {
    return new Observer((next) => {
      KlineSocket.subscribe({
        method: 'deals.subscribe',
        getResultMethod: 'deals.update',
        params: symbols,
        callback: pro => pro.then((data) => {
          next({ symbol: data[0], deals: data[1].map(dealNumStringForObj) })
        }),
      })
    })
  }

  static dealsUnsubscribe() {
    KlineSocket.unsubscribe('deals.unsubscribe')
  }

  /**
   * 深度图
   * */
  static depthQuery({ symbol, limit = 40, interval = '0.00000001' }) {
    return Socket.request({
      method: 'depth.query',
      params: [symbol, limit, interval],
    }).then((data) => {
      const c = (item) => {
        const obj = dealNumStringForObj(item)
        return { price: obj[0], amount: obj[1] }
      }
      return { sell: data.asks.map(c), buy: data.bids.map(c) }
    })
  }

  static depthSubscribe({ symbol, limit = 50, interval = '0.00000001' }) {
    // limit值 1, 5, 10, 20, 30, 50, 100
    return new Observer((next) => {
      Socket.subscribe({
        method: 'depth.subscribe',
        getResultMethod: 'depth.update',
        params: [symbol, limit, interval],
        callback: pro => pro.then((data) => {
          const c = (item) => {
            const obj = dealNumStringForObj(item)
            return { price: obj[0], amount: obj[1] }
          }
          next({
            symbol: data[2],
            buy: data[1].bids && data[1].bids.map(c),
            sell: data[1].asks && data[1].asks.map(c),
            clean: data[0],
          })
        }),
      })
    })
  }

  static depthUnsubscribe() {
    Socket.unsubscribe('depth.unsubscribe')
  }

  /**
   * 我的订单
   * side
   * 1, sell
   * 2, buy
   *
   * type
   * 1, limit
   * 2, market
   * */
  static orderQuery({ symbol, offset = 0, limit = 20 }) {
    return MarketSocket.Auth().then(() => Socket.request({
      method: 'order.query',
      params: [symbol, offset, limit],
    })).then(data => ({
      ...data,
      records: data.records.map(item => objNumDeal({
        ...dealNumStringForObj(item),
        symbol1: item.market.split('_').join('/'),
        average: toNumNotExponential(+item.deal_stock ? item.deal_money / item.deal_stock : 0),
        status: status(item),
        total: toNumNotExponential(+item.side === 2 && +item.type === 2 ? item.amount
          : (item.deal_money || item.price * item.amount)),
      })),
    }))
  }

  // eslint-disable-next-line
  static orderHistoryQuery({ symbol, start_time = 0, end_time = 0, offset = 0, limit = 10, side = 0 }) {
    return MarketSocket.Auth().then(() => Socket.request({
      method: 'order.history',
      params: [symbol, start_time, end_time, offset, limit, side],
    })).then(data => ({
      ...data,
      records: data.records.map(item => objNumDeal({
        ...dealNumStringForObj(item),
        symbol1: item.market.split('_').join('/'),
        average: toNumNotExponential(+item.deal_stock ? item.deal_money / item.deal_stock : 0),
        status: status(item),
        total: toNumNotExponential(+item.side === 2 && +item.type === 2 ? item.amount
          : (item.deal_money || item.price * item.amount)),
      })),
    }))
  }

  static orderSubscribe(symbols) {
    return new Observer((next) => {
      MarketSocket.Auth().then(() => {
        Socket.subscribe({
          method: 'order.subscribe',
          getResultMethod: 'order.update',
          params: symbols,
          callback: pro => pro.then((data) => {
            const [event, d] = data
            const { market, deal_stock, deal_money, ftime, mtime, price, side, type, amount } = d
            next({
              event,
              order: objNumDeal({
                ...dealNumStringForObj(d),
                symbol1: market.split('_').join('/'),
                average: toNumNotExponential(+deal_stock ? deal_money / deal_stock : 0),
                status: status(d),
                ftime: ftime || mtime,
                total: toNumNotExponential(+side === 2 && +type === 2 ? amount
                  : (deal_money || price * amount)),
              }),
            })
          }),
        })
      })
    })
  }

  static orderUnsubscribe() {
    Socket.unsubscribe('order.unsubscribe')
  }

  /**
   * 我的资产
   * */
  static assetQuery(symbols = null) {
    return MarketSocket.Auth().then(() => Socket.request({
      method: 'asset.query',
      params: symbols,
    }))
  }

  // eslint-disable-next-line
  static assetHistoryQuery({ symbol = null, business = null, start_time = 0, end_time = 0, offset = 0, limit = 10 }) {
    return MarketSocket.Auth().then(() => Socket.request({
      method: 'asset.history',
      params: [symbol, business, start_time, end_time, offset, limit],
    }))
  }

  static assetSubscribe(symbols) {
    return new Observer((next) => {
      MarketSocket.Auth().then(() => {
        Socket.subscribe({
          method: 'asset.subscribe',
          getResultMethod: 'asset.update',
          params: symbols,
          callback: pro => pro.then((data) => {
            const result = data
              && data.reduce((pre, item) => ({ ...pre, ...dealNumStringForObj(item) }), {})
            next(result)
          }),
        })
      })
    })
  }

  static assetUnsubscribe() {
    Socket.unsubscribe('asset.unsubscribe')
  }
}

MarketSocket.authorized = false

Socket.statusChange.subscribe((st) => {
  if (st === 'close' || st === 'error') {
    MarketSocket.authorized = false
  }
})
