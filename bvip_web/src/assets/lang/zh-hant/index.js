import { home } from '$router/ThemeComponents'
// eslint-disable-next-line import/no-unresolved,import/extensions
import common from 'assets/lang/zh-hant/common-<<mask>>'
import otc from 'assets/lang/zh-hant/otc'

export default {
  ...common,
  ...otc,
  ...home['zh-hant'],
}
