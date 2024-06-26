import type { TransactionInfo } from '@summer_fi/summerfi-sdk-common'
import type { OmniTxData } from 'features/omni-kit/hooks'

export function mapTxInfoToOmniTxData(txInfo: TransactionInfo | undefined): OmniTxData | undefined {
  if (txInfo == null) {
    return undefined
  }
  const { transaction } = txInfo
  return {
    data: transaction.calldata,
    to: transaction.target.value,
    value: transaction.value,
  }
}
