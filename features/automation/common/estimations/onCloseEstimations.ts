import { getCloseToCollateralParams, getCloseToDaiParams } from '@oasisdex/multiply'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { AVERAGE_CLOSE_VAULT_COST } from 'features/automation/common/estimations/helpers'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'

export function getOnCloseEstimations({
  colMarketPrice,
  colOraclePrice,
  debt,
  debtOffset,
  ethMarketPrice,
  lockedCollateral,
  toCollateral,
}: {
  colMarketPrice: BigNumber
  colOraclePrice: BigNumber
  debt: BigNumber
  debtOffset: BigNumber
  ethMarketPrice: BigNumber
  lockedCollateral: BigNumber
  toCollateral: boolean
}) {
  const { gasPrice$ } = useAppContext()
  const [gasPrice] = useObservable(gasPrice$)

  const { userSettings$ } = useAppContext()
  const [userSettings] = useObservable(userSettings$)

  const slippage = userSettings?.slippage || zero

  const marketParams = {
    oraclePrice: colOraclePrice,
    marketPrice: colMarketPrice,
    OF: OAZO_FEE,
    FF: LOAN_FEE,
    slippage,
  }
  const vaultInfo = { currentDebt: debt.plus(debtOffset), currentCollateral: lockedCollateral }

  const estimatedGasFeeOnTrigger = gasPrice
    ? amountFromWei(AVERAGE_CLOSE_VAULT_COST.times(gasPrice?.maxFeePerGas).times(ethMarketPrice))
    : undefined

  if (toCollateral) {
    const { fromTokenAmount, loanFee, oazoFee } = getCloseToCollateralParams(
      marketParams,
      vaultInfo,
    )
    const estimatedOasisFeeOnTrigger = oazoFee.plus(loanFee)

    return {
      estimatedGasFeeOnTrigger,
      estimatedOasisFeeOnTrigger,
      estimatedProfitOnClose: lockedCollateral.minus(fromTokenAmount),
      ...(estimatedGasFeeOnTrigger && {
        totalTriggerCost: estimatedOasisFeeOnTrigger.plus(estimatedGasFeeOnTrigger),
      }),
    }
  } else {
    const { loanFee, minToTokenAmount, oazoFee } = getCloseToDaiParams(marketParams, vaultInfo)
    const estimatedOasisFeeOnTrigger = oazoFee.plus(loanFee)

    return {
      estimatedGasFeeOnTrigger,
      estimatedOasisFeeOnTrigger,
      estimatedProfitOnClose: minToTokenAmount.minus(debt),
      ...(estimatedGasFeeOnTrigger && {
        totalTriggerCost: estimatedOasisFeeOnTrigger.plus(estimatedGasFeeOnTrigger),
      }),
    }
  }
}
