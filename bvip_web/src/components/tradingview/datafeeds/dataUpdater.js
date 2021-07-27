/* eslint-disable */
/**
 * 数据更新器
 * 通过更新器触发datafeeds的getBars实时更新图表数据
 */
class dataUpdater {
  constructor(datafeeds) {
    this.subscribers = {}
    this.requestsPending = 0
    this.historyProvider = datafeeds
  }
  // formatGuid(listenerGuid){
  //   const day=String(listenerGuid).split('_')[2]
  //   console.log(day)
  //   let dayVal=0
  //   switch (day) {
  //     case '1D':
  //       dayVal = 1440;
  //       break
  //     case 'D':
  //       dayVal = 2880;
  //       break
  //     default:
  //       dayVal = 0;
  //   }
  //   return String(listenerGuid).replace(day,dayVal)
  // }
  subscribeBars(symbolInfo, resolution, newDataCallback, listenerGuid) {
    // console.log('listenerGuid===============================')
    // console.log(listenerGuid)
    // const day=String(listenerGuid).split('_')[2]
    // if(day === 'D' || day === '1D'){
    //   listenerGuid = this.formatGuid(listenerGuid)
    // }
    // console.log(listenerGuid)
    // console.log(this.subscribers)
    this.subscribers[listenerGuid] = {
      lastBarTime: null,
      listener: newDataCallback,
      resolution: resolution,
      symbolInfo: symbolInfo
    }
  }
  unsubscribeBars(listenerGuid) {
    // const day=String(listenerGuid).split('_')[2]
    // if(day === 'D' || day === '1D'){
    //   listenerGuid = this.formatGuid(listenerGuid)
    // }
    // console.log(listenerGuid)
    delete this.subscribers[listenerGuid]
  }
  updateData() {
    // if (this.requestsPending) return
    this.requestsPending = 0
    for (let listenerGuid in this.subscribers) {
      this.requestsPending++
      if(this.historyProvider.self.data.length>0){
        this.onSubscriberDataReceived(listenerGuid)
        // this.updateDataForSubscriber(listenerGuid).then(() => this.requestsPending--).catch(() => this.requestsPending--)
      }
    }
  }
  // updateDataForSubscriber(listenerGuid) {
  //   return new Promise((resolve, reject) => {
  //     // const subscriptionRecord = this.subscribers[listenerGuid]
  //     // const rangeEndTime = parseInt((Date.now() / 1000).toString())
  //     // const rangeStartTime = rangeEndTime - this.periodLengthSeconds(subscriptionRecord.resolution, 10)
  //     console.log(rangeStartTime)
  //     this.onSubscriberDataReceived(listenerGuid)
  //     // this.historyProvider.getBars(subscriptionRecord.symbolInfo, subscriptionRecord.resolution, rangeStartTime, rangeEndTime,
  //     //   bars => {
  //     //     console.log('resolve=============================')
  //     //     this.onSubscriberDataReceived(listenerGuid, bars)
  //         resolve()
  //     //   },
  //     //   () => {
  //     //     reject()
  //     //   }
  //     // )
  //   })
  // }
  onSubscriberDataReceived(listenerGuid) {
    const bars= this.historyProvider.self.updateData
    if (!this.subscribers.hasOwnProperty(listenerGuid)) return
    // if (!bars.length) return
    // const lastBar = bars[bars.length - 1]
    const subscriptionRecord = this.subscribers[listenerGuid]
    const bar = this.historyProvider.self.data
    const lastBar = this.historyProvider.self.data[bar.length-1]
    const lastTwoBar = this.historyProvider.self.data[bar.length-2]
    if (bars.time < subscriptionRecord.lastBarTime && lastBar.time < subscriptionRecord.lastBarTime) return
    // const isNewBar = subscriptionRecord.lastBarTime !== null && lastBar.time > subscriptionRecord.lastBarTime
    // if (isNewBar) {
    //   if (bars.length < 2) {
    //     throw new Error('Not enough bars in history for proper pulse update. Need at least 2.');
    //   }

      // const previousBar = bars[bars.length - 2]
      // const previousBar = this.historyProvider.self.updateData
      // subscriptionRecord.listener(bars)
    // }
    if(lastBar.time - lastTwoBar.time  === bars.time - lastBar.time || bars.time === lastBar.time){
      subscriptionRecord.listener(bars)
      if(subscriptionRecord.lastBarTime < bars.time){
        subscriptionRecord.lastBarTime = bars.time
        this.historyProvider.self.data.push(bars)
      }
    }
  }
}

export default dataUpdater
