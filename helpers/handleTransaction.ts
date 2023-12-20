import type { TxMeta, TxState } from '@oasisdex/transactions'
import { TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import { getOptimismTransactionFee } from 'blockchain/transaction-fee'
import { omniL2SupportedNetworks } from 'features/omni-kit/constants'
import type { TxError } from 'helpers/types'
import { zero } from 'helpers/zero'

export interface TxDetails {
  txHash: string
  txStatus: TxStatus
  txCost: BigNumber
  txError?: TxError
}

export async function handleTransaction<T extends TxMeta>({
  txState,
  ethPrice,
  setTxDetails,
  networkId,
  txData,
}: {
  txState: TxState<T>
  ethPrice: BigNumber
  setTxDetails: (txDetails: TxDetails) => void
  networkId?: NetworkIds
  txData?: string
}) {
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

  if (networkId && txData && omniL2SupportedNetworks.includes(networkId)) {
    const optimismTxFeeData = await getOptimismTransactionFee({
      estimatedGas: gasUsed.toString(),
      transactionData: txData,
    })

    if (!optimismTxFeeData) {
      return
    }

    totalCost = totalCost.plus(
      amountFromWei(new BigNumber(optimismTxFeeData.l1Fee)).times(optimismTxFeeData.ethUsdPriceUSD),
    )
  }

  setTxDetails({
    txHash: (txState as any).txHash,
    txStatus: txState.status,
    txError: txState.status === TxStatus.Error ? txState.error : undefined,
    txCost: totalCost,
  })
}
