import store from 'data/store'
import UUID from 'uuid/v4'

// 阿里 OSS 服务 SDK
const OSS = import('ali-oss/dist/aliyun-oss-sdk' /* webpackChunkName: "Ali-Oss" */)

export default class AliOss {
  // 处理 OSS 配置
  static dealConfig(ossConfig) {
    if (ossConfig && ossConfig.credentials) {
      const {
        bucket,
        endpoint,
        credentials: { access_key_id, access_key_secret, security_token },
      } = ossConfig
      return {
        region: endpoint.split('.')[0],
        accessKeyId: access_key_id,
        accessKeySecret: access_key_secret,
        stsToken: security_token,
        bucket,
      }
    }
    return null
  }

  // 判断 OSS 配置是否相同
  static isConfigSame(config) {
    const oldConfig = AliOss.config
    if (!config || !oldConfig) return true
    return [
      'region',
      'accessKeyId',
      'accessKeySecret',
      'stsToken',
      'bucket',
    ].every(k => config[k] === oldConfig[k])
  }

  // 更新 OSS 实例
  static oss(ossConfig) {
    const config = AliOss.dealConfig(ossConfig)

    // 如果 config 不为空，并且和旧的 config 配置对象不一样，则更新 OSS 实例
    if (config && (!AliOss.ossObj || !AliOss.isConfigSame(config))) {
      AliOss.ossObj = OSS
        .then((Oss) => {
          const instance = new Oss(config)
          AliOss.config = config
          return instance
        })
    }
  }

  // 上传文件
  static ossUpload(file) {
    if (!file) return Promise.reject(new Error('Upload file is null'))

    // 获取 store 中的 OSS 配置，并更新 OSS 实例
    AliOss.oss(store.state.user.ossConfig)

    const { ossObj } = AliOss

    if (!ossObj) return Promise.reject(new Error('Prop `ossObj` of AliOss is null'))

    // 设置文件名
    const suffix = file.name.split('.').pop()
    const filename = `${UUID()}.${suffix}`

    // 上传
    return ossObj.then(oss => oss.put(filename, file))
  }
}

// OSS 实例对象
AliOss.ossObj = null

// OSS 当前的配置对象
AliOss.config = null
