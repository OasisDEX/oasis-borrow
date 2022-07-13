import BigNumber from 'bignumber.js'
import { BasicBSTriggerData, maxUint256 } from 'features/automation/common/basicBSTriggerData'

export function resolveMaxBuyOrMinSellPrice(maxBuyOrMinSellPrice: BigNumber) {
  return maxBuyOrMinSellPrice.isZero() || maxBuyOrMinSellPrice.isEqualTo(maxUint256)
    ? undefined
    : maxBuyOrMinSellPrice
}

export function resolveWithThreshold({
  maxBuyOrMinSellPrice,
  triggerId,
}: {
  maxBuyOrMinSellPrice: BigNumber
  triggerId: BigNumber
}) {
  return (
    (!maxBuyOrMinSellPrice.isZero() && !maxBuyOrMinSellPrice.isEqualTo(maxUint256)) ||
    triggerId.isZero()
  )
}

export function prepareBasicBSResetData(basicBSTriggersData: BasicBSTriggerData) {
  return {
    targetCollRatio: basicBSTriggersData.targetCollRatio,
    execCollRatio: basicBSTriggersData.execCollRatio,
    maxBuyOrMinSellPrice: resolveMaxBuyOrMinSellPrice(basicBSTriggersData.maxBuyOrMinSellPrice),
    maxBaseFeeInGwei: basicBSTriggersData.maxBaseFeeInGwei,
    withThreshold: resolveWithThreshold({
      maxBuyOrMinSellPrice: basicBSTriggersData.maxBuyOrMinSellPrice,
      triggerId: basicBSTriggersData.triggerId,
    }),
    txDetails: {},
  }
}
