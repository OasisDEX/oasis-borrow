import { createDsProxy } from 'blockchain/calls/proxy'
import { openGuniMultiplyVault } from 'blockchain/calls/proxyActions/proxyActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { AddGasEstimationFunction } from 'helpers/context/types'
import { OAZO_LOWER_FEE, SLIPPAGE } from 'helpers/multiply/calculations.constants'
import { one, zero } from 'helpers/zero'
import type { Observable } from 'rxjs'

import type { OpenGuniVaultState } from './openGuniVault.types'

export function applyGuniEstimateGas(
  addGasEstimation$: AddGasEstimationFunction,
  state: OpenGuniVaultState,
): Observable<OpenGuniVaultState> {
  return addGasEstimation$(state, ({ estimateGas }: TxHelpers) => {
    const {
      proxyAddress,
      depositAmount,
      ilk,
      token,
      account,
      swap,
      token0Amount,
      minToTokenAmount,
      requiredDebt,
      isProxyStage,
    } = state

    const daiAmount =
      swap?.status === 'SUCCESS' ? swap.quoteAmount.div(one.minus(OAZO_LOWER_FEE)) : zero
    const collateralAmount =
      swap?.status === 'SUCCESS' ? swap.collateralAmount.times(one.minus(SLIPPAGE)) : zero

    if (proxyAddress && depositAmount) {
      return estimateGas(openGuniMultiplyVault, {
        kind: TxMetaKind.openGuni,
        depositCollateral: depositAmount, //
        userAddress: account,
        proxyAddress: proxyAddress!,
        ilk,
        token,
        exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '0x',
        exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '0x',
        minToTokenAmount,
        requiredDebt: requiredDebt!,
        toTokenAmount: collateralAmount,
        fromTokenAmount: daiAmount,
        token0Amount: token0Amount || zero,
      })
    }

    if (isProxyStage) {
      return estimateGas(createDsProxy, { kind: TxMetaKind.createDsProxy })
    }

    return undefined
  })
}
