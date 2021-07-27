import { Http } from 'extensions/http'
import { CustomCoinBase } from 'utils/CustomCoinBase'
import { calcRate } from 'utils/DataDeal'

export default class Market {
  static getSymbols() {
    return Http.get('/symbol')
      .then(res => CustomCoinBase.getCustom().then(customCoins => res.map(item => ({
        ...item,
        symbol1: item.symbol.split('_').join('/'),
        rate: calcRate(item.last, item.open),
        tableSelected: customCoins.includes(item.ID) ? 'checked' : '',
      }))))
  }

  static getSymbolClasses() {
    return Http.get('/symbolClass')
  }

  static getAssetsInfoList({ search = '', offset = 0, limit = 10 }) {
    return Http.get('/assetIntro', { search, offset, limit })
  }

  static getAssetInfo(assetCode) {
    return Http.get(`/assetIntro/${assetCode}`)
  }
  /* eslint-disable */
  static klineQuery({ symbol, startTime, endTime = Date.now(), interval }) {
    // const start = parseInt((endTime - Math.max(0, limit - 1) * interval*1000)/ 1000)
    const start = parseInt(startTime / 1000)
    const end = parseInt(endTime / 1000)
    return Http.get('/kline/query', { symbol, start, end, interval })
  }

  static getForeignOtcAssets() {
    return Http.get('otcAssets')
  }
}
