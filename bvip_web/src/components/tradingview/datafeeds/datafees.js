/* eslint-disable */
/**
 * JS API
 */
import dataUpdater from './dataUpdater'
class datafeeds {

  /**
   * JS API
   * @param {*Object} vue vue实例
   */
  constructor(vue) {
    this.self = vue
    this.barsUpdater = new dataUpdater(this)
  }

  /**
   * @param {*Function} callback  回调函数
   * `onReady` should return result asynchronously.
   */
  onReady(callback) {
    console.log('callback  回调函数 onReady')
    return new Promise((resolve, reject) => {
      let configuration = this.defaultConfiguration()
      if (this.self.getConfig) {
        configuration = Object.assign(this.defaultConfiguration(), this.self.getConfig())
      }
      resolve(configuration)
      this.self.onReadyState = true
    }).then(data => callback(data))
  }

  /**
   * @param {*String} symbolName  商品名称或ticker
   * @param {*Function} onSymbolResolvedCallback 成功回调
   * @param {*Function} onResolveErrorCallback   失败回调
   * `resolveSymbol` should return result asynchronously.
   */
  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    // console.log('resolveSymbol')
    let pricescale = 1000;
    try {
      const scoreList = String(this.self.coin.min_quantity).split('.');
      let score = '0'
      if(scoreList.length >= 2){
        score = scoreList[1]
      }
      const scoreLength = String(score).length;
      let num = '1';
      for(let i=0; i<scoreLength; i++){
        num += '0';
      }
      pricescale = Number(num)
    }catch (e) {
      pricescale = 1000
    }
    return new Promise((resolve, reject) => {
      let symbolInfo = this.defaultSymbol()
      symbolInfo.pricescale = pricescale
      if (this.self.getSymbol) {
        symbolInfo = Object.assign(this.defaultSymbol(), this.self.getSymbol())
      }
      resolve(symbolInfo)
    }).then(data => onSymbolResolvedCallback(data)).catch(err => onResolveErrorCallback(err))
  }

  /**
   * @param {*Object} symbolInfo  商品信息对象
   * @param {*String} resolution  分辨率
   * @param {*Number} rangeStartDate  时间戳、最左边请求的K线时间
   * @param {*Number} rangeEndDate  时间戳、最右边请求的K线时间
   * @param {*Function} onDataCallback  回调函数
   * @param {*Function} onErrorCallback  回调函数
   */
  getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onDataCallback, onErrorCallback) {
    const onLoadedCallback = data => {
      data && data.length ? onDataCallback(data, { noData: true }) : onDataCallback([], { noData: true })
    }
    const StartDate = parseInt((rangeEndDate - rangeStartDate)*3/4 + rangeStartDate)
    this.self.getBars(symbolInfo, resolution, StartDate, rangeEndDate, onLoadedCallback)
  }

  /**
   * 订阅K线数据。图表库将调用onRealtimeCallback方法以更新实时数据
   * @param {*Object} symbolInfo 商品信息
   * @param {*String} resolution 分辨率
   * @param {*Function} onRealtimeCallback 回调函数
   * @param {*String} subscriberUID 监听的唯一标识符
   * @param {*Function} onResetCacheNeededCallback (从1.7开始): 将在bars数据发生变化时执行
   */
  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    // console.log('subscribeBars')
    this.barsUpdater.subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback)
  }

  /**
   * 取消订阅K线数据
   * @param {*String} subscriberUID 监听的唯一标识符
   */
  unsubscribeBars(subscriberUID) {
    // console.log('unsubscribeBars')
    // console.log(this.barsUpdater.subscribers)
    this.barsUpdater.unsubscribeBars(subscriberUID)
  }
  /**
   * 默认配置
   */
  defaultConfiguration() {
    return {
      supports_search: true,
      supports_group_request: false,
      supported_resolutions: ['1', '5', '15', '30', '60', '120', '240','360','720','1D', '1W'],
      supports_marks: true,
      supports_timescale_marks: true,
      supports_time: true
    }
  }

  /**
   * 默认商品信息
   */
  defaultSymbol() {
    return {
      // 'name': 'BTCUSDT',
      'name': this.self.symbol,
      // 'timezone': 'UTC',
      'minmov': 1,
      'minmov2': 0,
      'pointvalue': 1,
      // 'fractional': false,
      'session': '24x7',
      'has_intraday': true,
      'has_no_volume': false,
      // 'description': 'BTCUSDT',
      'description': this.self.symbol,
      'pricescale': 10000,
      data_status: 'streaming',
      // 'ticker': 'BTCUSDT',
      'ticker': this.self.symbol,
      'volume_precision': 0,//显示此商品成交量的小数位:0位
      'intraday_multipliers':['1', '5', '15', '30', '60', '120', '240','360','720','1D', '1W'],
      'supported_resolutions': ['1', '5', '15', '30', '60', '120', '240','360','720','1D', '1W'],
    }
  }
}

export default datafeeds
