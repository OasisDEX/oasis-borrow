import { getCloseToCollateralParams, getCloseToDaiParams } from '@oasisdex/multiply'
import { amountFromWei } from '@oasisdex/utils'
import type BigNumber from 'bignumber.js'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { AVERAGE_CLOSE_VAULT_COST } from 'features/automation/common/estimations/helpers'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations.constants'
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
  const { gasPriceOnNetwork$, context$ } = useMainContext()
  const [context] = useObservable(context$)
  const [gasPrice] = useObservable(gasPriceOnNetwork$(context?.chainId))

  const { userSettings$ } = useAccountContext()
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
