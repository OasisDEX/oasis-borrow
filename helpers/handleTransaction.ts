import type { TxMeta, TxState } from '@oasisdex/transactions'
import { TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import { getNetworkById, type NetworkIds } from 'blockchain/networks'
import { getTransactionFee } from 'blockchain/transaction-fee'
import type { TxError } from 'helpers/types'
import { zero } from 'helpers/zero'

export interface TxDetails {
  txHash: string
  txStatus: TxStatus
  txCost: BigNumber
  txError?: TxError
}

export async function handleTransaction<T extends TxMeta>({
  ethPrice,
  networkId,
  setTxDetails,
  txData,
  txState,
}: {
  ethPrice: BigNumber
  networkId?: NetworkIds
  setTxDetails: (txDetails: TxDetails) => void
  txData?: string
  txState: TxState<T>
}) {
  const isL2 = networkId ? getNetworkById(networkId) : false
  const gasUsed =
    txState.status === TxStatus.Success ? new BigNumber(txState.receipt.gasUsed.toString()) : zero

  const effectiveGasPrice =
    txState.status === TxStatus.Success
      ? new BigNumber(txState.receipt.effectiveGasPrice.toString())
      : zero

  let totalCost =
    !gasUsed.eq(zero) && !effectiveGasPrice.eq(zero)
      ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(ethPrice)
      : zero

  if (networkId && txData && isL2) {
    const l2TxFeeData = await getTransactionFee({
      estimatedGas: gasUsed.toString(),
    })

    if (!l2TxFeeData) {
      return
    }

    totalCost = totalCost.plus(amountFromWei(new BigNumber(l2TxFeeData.feeUsd)))
  }

  setTxDetails({
    txHash: (txState as any).txHash,
    txStatus: txState.status,
    txError: txState.status === TxStatus.Error ? txState.error : undefined,
    txCost: totalCost,
  })
}
