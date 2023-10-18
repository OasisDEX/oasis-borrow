import type { Strategy } from '@oasisdex/dma-library'
import { TxStatus } from '@oasisdex/transactions'
import type { AjnaTxData } from 'actions/ajna'
import { getAjnaParameters } from 'actions/ajna'
import { callOasisActionsWithDpmProxy } from 'blockchain/calls/oasisActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getRpcProvider } from 'blockchain/networks'
import type { CancelablePromise } from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import { useMainContext } from 'components/context/MainContextProvider'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { takeUntilTxState } from 'features/automation/api/takeUntilTxState'
import { getOmniIsFormEmpty } from 'features/omni-kit/common/helpers/getOmniIsFormEmpty'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate.constants'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { uiChanges } from 'helpers/uiChanges'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useEffect, useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

// TODO ideally this hook shouldn't accept any prop
// TODO currently it's not possible to access dynamicMetadata at this level due to circular dependency
export function useAjnaOmniTxHandler({ isFormValid }: { isFormValid: boolean }): () => void {
  const { txHelpers$, context$ } = useMainContext()
  const [txHelpers] = useObservable(txHelpers$)
  const [context] = useObservable(context$)
  const {
    tx: { setTxDetails, txDetails },
    environment: {
      collateralAddress,
      collateralPrecision,
      collateralPrice,
      collateralToken,
      ethPrice,
      quoteAddress,
      quotePrecision,
      quotePrice,
      quoteToken,
      product,
      slippage,
    },
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
  } = useOmniProductContext(product)

  const [txData, setTxData] = useState<AjnaTxData>()
  const [cancelablePromise, setCancelablePromise] =
    useState<CancelablePromise<Strategy<typeof position> | undefined>>()

  const { dpmAddress } = state
  const isFormEmpty = getOmniIsFormEmpty({
    product,
    state,
    position,
    currentStep,
    txStatus: txDetails?.txStatus,
  })

  useEffect(() => {
    cancelablePromise?.cancel()

    if (isFormEmpty) {
      setSimulation(undefined)
      setIsLoadingSimulation(false)
    } else {
      setIsLoadingSimulation(true)
    }
  }, [context?.chainId, state, isFormEmpty, slippage])

  useDebouncedEffect(
    () => {
      if (context && !isExternalStep && currentStep !== 'risk' && !isFormEmpty) {
        const promise = cancelable(
          getAjnaParameters({
            collateralAddress,
            collateralPrecision,
            collateralPrice,
            collateralToken,
            context,
            isFormValid,
            position: position as AjnaGenericPosition,
            simulation: simulation as AjnaGenericPosition,
            quoteAddress,
            quotePrecision,
            quotePrice,
            quoteToken,
            rpcProvider: getRpcProvider(context.chainId),
            slippage,
            state,
          }),
        )
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
    [context?.chainId, state, isExternalStep, slippage],
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

        if (txState.status === TxStatus.Success) dispatch({ type: 'reset' })
        handleTransaction({ txState, ethPrice, setTxDetails })
      })
}
