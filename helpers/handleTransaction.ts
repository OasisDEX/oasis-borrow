import type { TxMeta, TxState } from '@oasisdex/transactions'
import { TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import type { TxError } from 'helpers/types'
import { zero } from 'helpers/zero'

export interface TxDetails {
  txHash: string
  txStatus: TxStatus
  txCost: BigNumber
  txError?: TxError
}

export function handleTransaction<T extends TxMeta>({
  txState,
  ethPrice,
  setTxDetails,
}: {
  txState: TxState<T>
  ethPrice: BigNumber
  setTxDetails: (txDetails: TxDetails) => void
}) {
  const gasUsed =
    txState.status === TxStatus.Success ? new BigNumber(txState.receipt.gasUsed) : zero

  const effectiveGasPrice =
    txState.status === TxStatus.Success ? new BigNumber(txState.receipt.effectiveGasPrice) : zero

  const totalCost =
    !gasUsed.eq(zero) && !effectiveGasPrice.eq(zero)
      ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(ethPrice)
      : zero

  setTxDetails({
    txHash: (txState as any).txHash,
    txStatus: txState.status,
    txError: txState.status === TxStatus.Error ? txState.error : undefined,
    txCost: totalCost,
  })
}
