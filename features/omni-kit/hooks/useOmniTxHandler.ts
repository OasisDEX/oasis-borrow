import type { AjnaStrategy } from '@oasisdex/dma-library'
import { TxStatus } from '@oasisdex/transactions'
import { callOasisActionsWithDpmProxy } from 'blockchain/calls/oasisActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import type { CancelablePromise } from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import { useMainContext } from 'components/context/MainContextProvider'
import { takeUntilTxState } from 'features/automation/api/takeUntilTxState'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { OmniGenericPosition } from 'features/omni-kit/types'
import { OmniSidebarStep } from 'features/omni-kit/types'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate.constants'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { uiChanges } from 'helpers/uiChanges'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useEffect, useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

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
  const { txHelpers$ } = useMainContext()
  const [txHelpers] = useObservable(txHelpers$)

  const {
    tx: { setTxDetails },
    environment: { ethPrice, productType, slippage },
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

  const { dpmAddress } = state

  useEffect(() => {
    cancelablePromise?.cancel()

    if (isFormEmpty) {
      setSimulation(undefined)
      setIsLoadingSimulation(false)
    } else {
      setIsLoadingSimulation(true)
    }
  }, [state, isFormEmpty, slippage])

  useDebouncedEffect(
    () => {
      if (!isExternalStep && currentStep !== OmniSidebarStep.Risk && !isFormEmpty) {
        const promise = cancelable(getOmniParameters())
        setCancelablePromise(promise)

        promise
          .then((data) => {
            if (data) {
              setTxData(data.tx)
              setSimulation(data.simulation)
              setIsLoadingSimulation(false)
              uiChanges.publish(TX_DATA_CHANGE, {
                type: 'tx-data',
                transaction: callOasisActionsWithDpmProxy,
                data: {
                  kind: TxMetaKind.libraryCall,
                  proxyAddress: dpmAddress,
                  ...data?.tx,
                },
              })
            }
          })
          .catch((error) => {
            setIsLoadingSimulation(false)
            console.error(error)
          })
      }
    },
    [state, isExternalStep, slippage, customState],
    250,
  )

  if (!txHelpers || !txData || !dpmAddress) {
    return () => console.warn('no txHelpers or txData or proxyAddress')
  }

  return () =>
    txHelpers
      .send(callOasisActionsWithDpmProxy, {
        kind: TxMetaKind.libraryCall,
        proxyAddress: dpmAddress,
        ...txData,
      })
      .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
      .subscribe((txState) => {
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
        handleTransaction({ txState, ethPrice, setTxDetails })
      })
}
