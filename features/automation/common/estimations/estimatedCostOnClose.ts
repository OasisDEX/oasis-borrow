import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { AVERAGE_CLOSE_VAULT_COST } from 'features/automation/common/estimations/helpers'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { useObservable } from 'helpers/observableHook'
import { one } from 'helpers/zero'

export function getEstimatedCostOnClose({
  colMarketPrice,
  debt,
  debtOffset,
  ethMarketPrice,
  lockedCollateral,
  toCollateral,
}: {
  colMarketPrice: BigNumber
  debt: BigNumber
  debtOffset: BigNumber
  ethMarketPrice: BigNumber
  lockedCollateral: BigNumber
  toCollateral: boolean
}) {
  const { gasPrice$ } = useAppContext()
  const [gasPrice] = useObservable(gasPrice$)

  const currentDebt = debt.plus(debtOffset)
  const toTokenAmount = lockedCollateral.times(colMarketPrice).times(one.minus(OAZO_FEE))
  const requiredAmount = currentDebt.times(one.plus(OAZO_FEE)).times(one.plus(LOAN_FEE))

  const oasisFee = toCollateral
    ? requiredAmount.times(OAZO_FEE)
    : lockedCollateral.times(colMarketPrice).minus(toTokenAmount)
  const loanFee = toCollateral ? requiredAmount.times(LOAN_FEE) : currentDebt.times(LOAN_FEE)

  const estimatedOasisFeeOnTrigger = oasisFee.plus(loanFee)
  const estimatedGasFeeOnTrigger = gasPrice
    ? amountFromWei(AVERAGE_CLOSE_VAULT_COST.times(gasPrice?.maxFeePerGas).times(ethMarketPrice))
    : undefined

  return {
    estimatedOasisFeeOnTrigger,
    estimatedGasFeeOnTrigger,
    ...(estimatedGasFeeOnTrigger && {
      totalTriggerCost: estimatedOasisFeeOnTrigger.plus(estimatedGasFeeOnTrigger),
    }),
  }
}
