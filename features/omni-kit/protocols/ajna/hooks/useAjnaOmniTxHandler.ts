import type { Strategy } from '@oasisdex/dma-library'
import { TxStatus } from '@oasisdex/transactions'
import type { AjnaTxData } from 'actions/ajna'
import { callOasisActionsWithDpmProxy } from 'blockchain/calls/oasisActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getRpcProvider } from 'blockchain/networks'
import type { CancelablePromise } from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import { useMainContext } from 'components/context/MainContextProvider'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { takeUntilTxState } from 'features/automation/api/takeUntilTxState'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { useAjnaCustomState } from 'features/omni-kit/protocols/ajna/contexts/AjnaCustomStateContext'
import { getAjnaOmniParameters } from 'features/omni-kit/protocols/ajna/helpers/getAjnaOmniParameters'
import { OmniSidebarStep } from 'features/omni-kit/types'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate.constants'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { uiChanges } from 'helpers/uiChanges'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useEffect, useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

export function useAjnaOmniTxHandler(): () => void {
  const { txHelpers$, context$ } = useMainContext()
  const [txHelpers] = useObservable(txHelpers$)
  const [context] = useObservable(context$)

  const {
    tx: { setTxDetails },
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
      productType,
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
    dynamicMetadata: {
      validations: { isFormValid },
      values: { isFormEmpty },
    },
  } = useOmniProductContext(productType)
  const {
    state: { price },
    dispatch: customDispatch,
  } = useAjnaCustomState()

  const [txData, setTxData] = useState<AjnaTxData>()
  const [cancelablePromise, setCancelablePromise] =
    useState<CancelablePromise<Strategy<typeof position> | undefined>>()

  const { dpmAddress } = state

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
      if (context && !isExternalStep && currentStep !== OmniSidebarStep.Risk && !isFormEmpty) {
        const promise = cancelable(
          getAjnaOmniParameters({
            chainId: context.chainId,
            collateralAddress,
            collateralPrecision,
            collateralPrice,
            collateralToken,
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
            price,
            walletAddress: context.account,
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
    [context?.chainId, state, isExternalStep, slippage, price],
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
          customDispatch({ type: 'reset' })
        }
        handleTransaction({ txState, ethPrice, setTxDetails })
      })
}
