import { CustomCoinBase } from 'utils/CustomCoinBase'

/**
 * @desc 管理自选交易对
 * @class CustomCoin
 */
export class CustomCoin extends CustomCoinBase {
  // static getCustonRemote() {
  //   return store.state.user.info.id ? UserDefault.getCustomCoin().then((res) => {
  //     CustomCoinBase.setCustom(res);
  //     return res;
  //   }, e => console.error(e)) : Promise.reject(new Error('sign-in.not'));
  // }
  //
  // static setCustom(arr = []) {
  //   return (store.state.user.info.id ? UserDefault.setCustomCoin(arr)
  // : Promise.resolve()).then(() => {
  //     CustomCoinBase.setCustom(arr);
  //   }, e => console.error(e));
  // }
  //
  // static addCustom(id) {
  //   return (store.state.user.info.id ? UserDefault.setCustomCoin(id)
  // : Promise.resolve()).then(() => {
  //     CustomCoinBase.addCustom(id);
  //   }, e => console.error(e));
  // }
  //
  // static delCustom(id) {
  //   return (store.state.user.info.id ? UserDefault.setCustomCoin(id)
  // : Promise.resolve()).then(() => {
  //     CustomCoinBase.delCustom(id);
  //   }, e => console.error(e));
  // }

  static setCustom(arr = []) {
    return Promise.resolve().then(() => {
      CustomCoinBase.setCustom(arr)
    }, e => console.error(e))
  }

  static addCustom(id) {
    return Promise.resolve().then(() => {
      CustomCoinBase.addCustom(id)
    }, e => console.error(e))
  }

  static delCustom(id) {
    return Promise.resolve().then(() => {
      CustomCoinBase.delCustom(id)
    }, e => console.error(e))
  }
}
