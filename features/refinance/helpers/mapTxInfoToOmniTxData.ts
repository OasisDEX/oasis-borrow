import type { OmniTxData } from 'features/omni-kit/hooks'
import type { TransactionInfo } from 'summerfi-sdk-common'

export function mapTxInfoToOmniTxData(txInfo: TransactionInfo | undefined): OmniTxData | undefined {
  if (txInfo == null) {
    return undefined
  }
  throw new Error('Function not implemented.')
}
