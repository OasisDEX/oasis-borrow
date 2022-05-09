import { Observable } from 'rxjs'

import { createDsProxy } from '../../../../../blockchain/calls/proxy'
import { closeGuniVaultCall } from '../../../../../blockchain/calls/proxyActions/proxyActions'
import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { AddGasEstimationFunction, TxHelpers } from '../../../../../components/AppContext'
import { zero } from '../../../../../helpers/zero'
import { ManageMultiplyVaultState } from '../../../../multiply/manage/pipes/manageMultiplyVault'
import { GuniTxData } from './manageGuniVault'

export function applyGuniManageEstimateGas(
  addGasEstimation$: AddGasEstimationFunction,
  state: ManageMultiplyVaultState & GuniTxData,
): Observable<ManageMultiplyVaultState> {
  return addGasEstimation$(state, ({ estimateGas }: TxHelpers) => {
    const {
      proxyAddress,
      account,
      toTokenAmount,
      fromTokenAmount,
      requiredDebt,
      swap,
      minToTokenAmount,
      vault,
      isProxyStage,
    } = state

    if (proxyAddress) {
      return estimateGas(closeGuniVaultCall, {
        kind: TxMetaKind.closeGuni,
        token: vault.token,
        ilk: vault.ilk,
        userAddress: account || '',
        requiredDebt: requiredDebt || zero,
        cdpId: vault.id.toString(),
        fromTokenAmount: fromTokenAmount || zero,
        toTokenAmount: toTokenAmount || zero,
        minToTokenAmount: minToTokenAmount || zero,
        exchangeAddress: swap?.status === 'SUCCESS' ? swap.tx.to : '0x',
        exchangeData: swap?.status === 'SUCCESS' ? swap.tx.data : '0x',
        proxyAddress: proxyAddress!,
      })
    }

    if (isProxyStage) {
      return estimateGas(createDsProxy, { kind: TxMetaKind.createDsProxy })
    }

    return undefined
  })
}
