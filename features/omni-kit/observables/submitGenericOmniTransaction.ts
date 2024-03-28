import type { TxMeta, TxState } from '@oasisdex/transactions'
import type { Signer } from 'ethers'
import type { OmniTxData } from 'features/omni-kit/hooks'
import { sendOmniTransaction$ } from 'features/omni-kit/observables'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { Dispatch, SetStateAction } from 'react'

interface SubmitGenericOmniTransactionParams {
  networkId: OmniSupportedNetworkIds
  proxyAddress: string
  setTxState?: Dispatch<SetStateAction<TxState<TxMeta> | undefined>>
  signer: Signer
  txData: OmniTxData
}

export function submitGenericOmniTransaction({
  networkId,
  proxyAddress,
  setTxState,
  signer,
  txData,
}: SubmitGenericOmniTransactionParams) {
  return () =>
    sendOmniTransaction$({ signer, networkId, txData, proxyAddress }).subscribe((txState) =>
      setTxState?.(txState as TxState<TxMeta>),
    )
}
