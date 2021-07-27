// 获取交易对的价格 - price，数量 - amount，总额 - total 的精度
export function getPrecision(symbol) {
  const { quote_asset_precision, base_asset_precision } = { ...symbol }
  const precisions = {}
  precisions.price = quote_asset_precision >= 0 ? quote_asset_precision : 8
  precisions.amount = base_asset_precision >= 0 ? base_asset_precision : 8
  precisions.total = precisions.price + precisions.amount
  return precisions
}
