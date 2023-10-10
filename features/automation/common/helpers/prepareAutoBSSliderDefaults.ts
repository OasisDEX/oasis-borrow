import BigNumber from 'bignumber.js'
import { DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET } from 'features/automation/common/consts'
import { zero } from 'helpers/zero'

export function prepareAutoBSSliderDefaults({
  execCollRatio,
  targetCollRatio,
  positionRatio,
  publishKey,
}: {
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  positionRatio: BigNumber
  publishKey: 'AUTO_SELL_FORM_CHANGE' | 'AUTO_BUY_FORM_CHANGE'
}) {
  const defaultTargetCollRatio = new BigNumber(positionRatio)

  const defaultTriggerForSell = new BigNumber(
    positionRatio.minus(DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET),
  )
  const defaultTriggerForBuy = new BigNumber(
    positionRatio.plus(DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET),
  )

  return {
    execCollRatio:
      execCollRatio.isZero() && positionRatio.gt(zero)
        ? publishKey === 'AUTO_SELL_FORM_CHANGE'
          ? defaultTriggerForSell.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
          : defaultTriggerForBuy.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
        : execCollRatio,
    targetCollRatio:
      targetCollRatio.isZero() && positionRatio.gt(zero)
        ? defaultTargetCollRatio.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
        : targetCollRatio,
  }
}
