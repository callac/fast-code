const SignUpTypes = [
  { name: $t => $t('phone-1') + $t('sign-up'), value: 'phone' },
  { name: $t => $t('email') + $t('sign-up'), value: 'email' },
]

/**
 * @desc 根据后台配置返回不同的注册信息
 * @typedef {Object} SignUpConfig
 * @property {String} defaultType
 * @property {Array} types
 *
 * @param {Number} default_register_method
 *                 1 为显示手机邮箱注册，默认手机注册
 *                 2 为显示手机邮箱注册，默认邮箱注册
 *                 3 为显示邮箱注册
 *                 4 为显示手机注册
 * @returns SignUpConfig
 * */
export function getSignUpConfig(default_register_method = 1) {
  let types = SignUpTypes
  let {
    value: defaultType = SignUpTypes[0].value,
  } = SignUpTypes[default_register_method - 1] || {}

  if (default_register_method === 3) {
    types = [SignUpTypes[1]]
    defaultType = SignUpTypes[1].value
  } else if (default_register_method === 4) {
    types = [SignUpTypes[0]]
    defaultType = SignUpTypes[0].value
  }

  return { defaultType, types }
}
