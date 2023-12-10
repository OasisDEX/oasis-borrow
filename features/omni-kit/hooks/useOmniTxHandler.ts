import type { AjnaStrategy } from '@oasisdex/dma-library'
import type { TxMeta, TxState } from '@oasisdex/transactions'
import { TxStatus } from '@oasisdex/transactions'
import type { TxMetaKind } from 'blockchain/calls/txMeta'
import type { CancelablePromise } from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import { useMainContext } from 'components/context/MainContextProvider'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { estimateOmniGas$, sendOmniTransaction$ } from 'features/omni-kit/observables'
import type { OmniGenericPosition } from 'features/omni-kit/types'
import { OmniSidebarStep } from 'features/omni-kit/types'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useEffect, useState } from 'react'

export interface OmniTxData {
  data: string
  to: string
  value: string
}

export interface OmniActionCallData extends OmniTxData {
  kind: TxMetaKind.libraryCall
  proxyAddress: string
}

export function useOmniTxHandler<CustomState>({
  getOmniParameters,
  onSuccess,
  customState,
}: {
  getOmniParameters: () => Promise<AjnaStrategy<OmniGenericPosition> | undefined>
  customState: CustomState
  onSuccess?: () => void // for resetting custom state
}): () => void {
  const { txHelpers$, connectedContext$ } = useMainContext()
  const [txHelpers] = useObservable(txHelpers$)
  const [context] = useObservable(connectedContext$)
  const signer = context?.transactionProvider

  const {
    tx: { setTxDetails, setGasEstimation },
    environment: { ethPrice, productType, slippage, networkId, gasPrice },
    steps: { isExternalStep, currentStep },
  } = useOmniGeneralContext()
  const {
    form: { dispatch, state },
    position: {
      currentPosition: { position, simulation },
      swap,
      setCachedPosition,
      setCachedSwap,
      setIsLoadingSimulation,
      setSimulation,
    },
    dynamicMetadata: {
      values: { isFormEmpty },
    },
  } = useOmniProductContext(productType)

  const [txData, setTxData] = useState<OmniTxData>()
  const [cancelablePromise, setCancelablePromise] =
    useState<CancelablePromise<AjnaStrategy<typeof position> | undefined>>()

  const { dpmAddress: proxyAddress } = state

  useEffect(() => {
    cancelablePromise?.cancel()

    if (isFormEmpty) {
      setSimulation(undefined)
      setIsLoadingSimulation(false)
      setGasEstimation(undefined)
    } else {
      setIsLoadingSimulation(true)
    }
  }, [state, isFormEmpty, slippage, customState])

  useDebouncedEffect(
    () => {
      if (!isExternalStep && currentStep !== OmniSidebarStep.Risk && !isFormEmpty) {
        const promise = cancelable(getOmniParameters())
        setCancelablePromise(promise)

        promise
          .then((data) => {
            if (data && signer) {
              setTxData(data.tx)
              setSimulation(data.simulation)
              setIsLoadingSimulation(false)
              estimateOmniGas$({
                signer,
                networkId,
                txData: data.tx,
                proxyAddress,
                gasPrice,
                ethPrice,
              }).subscribe((value) => setGasEstimation(value))
            }
          })
          .catch((error) => {
            setIsLoadingSimulation(false)
            console.error(error)
          })
      }
    },
    [state, isExternalStep, slippage, customState, signer],
    250,
  )

  if (!txHelpers || !txData || !proxyAddress || !signer?.provider) {
    return () => console.warn('no txHelpers or txData or proxyAddress or signer')
  }

  return () =>
    sendOmniTransaction$({ signer, networkId, txData, proxyAddress }).subscribe((txState) => {
      if (txState.status === TxStatus.WaitingForConfirmation) {
        setCachedPosition({
          position,
          simulation,
        })
        swap?.current && setCachedSwap(swap.current)
      }

      if (txState.status === TxStatus.Success) {
        dispatch({ type: 'reset' })
        onSuccess && onSuccess()
      }

      const castedTxState = txState as TxState<TxMeta>

      handleTransaction({ txState: castedTxState, ethPrice, setTxDetails })
    })
}
