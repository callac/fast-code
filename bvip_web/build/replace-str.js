const StrReplace = require('string-replace-webpack-plugin')
const { products } = require('../config/themes')

const factory = ({ theme = 'default', template = 'default', mask = 'default' }) => StrReplace.replace({
  replacements: [
    {
      pattern: /<<theme>>/g,
      replacement(match, pl, offset, string) {
        return theme
      },
    },
    {
      pattern: /<<template>>/g,
      replacement(match, pl, offset, string) {
        return template
      },
    },
    {
      pattern: /<<mask>>/g,
      replacement(match, pl, offset, string) {
        return mask
      },
    },
  ],
})

exports.factory = factory

exports.products = Object.keys(products)
  .reduce((pre, k) => ({ ...pre, [k]: { ...products[k], loader: factory(products[k]) } }), {})
