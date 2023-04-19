import { TxStatus } from '@oasisdex/transactions'
import { AjnaTxData, getAjnaParameters } from 'actions/ajna'
import { callOasisActionsWithDpmProxy } from 'blockchain/calls/oasisActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { cancelable, CancelablePromise } from 'cancelable-promise'
import { useAppContext } from 'components/AppContextProvider'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { isFormEmpty } from 'features/ajna/positions/common/helpers/isFormEmpty'
import { takeUntilTxState } from 'features/automation/api/automationTxHandlers'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useEffect, useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

import { Strategy } from '@oasisdex/oasis-actions-poc/src/types/common'

export interface OasisActionCallData extends AjnaTxData {
  kind: TxMetaKind.libraryCall
  proxyAddress: string
}

export function useAjnaTxHandler(): () => void {
  const { txHelpers$, context$, uiChanges } = useAppContext()
  const [txHelpers] = useObservable(txHelpers$)
  const [context] = useObservable(context$)
  const {
    tx: { setTxDetails },
    environment: { collateralPrice, collateralToken, ethPrice, quotePrice, quoteToken, product },
    steps: { isExternalStep, currentStep },
  } = useAjnaGeneralContext()
  const {
    form: { dispatch, state },
    position: {
      currentPosition: { position, simulation },
      setCachedPosition,
      setIsLoadingSimulation,
      setSimulation,
    },
    validation: { isFormValid },
  } = useAjnaProductContext(product)

  const [txData, setTxData] = useState<AjnaTxData>()
  const [cancelablePromise, setCancelablePromise] =
    useState<CancelablePromise<Strategy<typeof position> | undefined>>()

  const { dpmAddress } = state

  useEffect(() => {
    cancelablePromise?.cancel()
    if (isFormEmpty({ product, state, position, currentStep })) {
      setSimulation(undefined)
      setIsLoadingSimulation(false)
    } else {
      setIsLoadingSimulation(true)
    }
  }, [context?.rpcProvider, dpmAddress, state])

  useDebouncedEffect(
    () => {
      if (context && !isExternalStep && currentStep !== 'risk') {
        const promise = cancelable(
          getAjnaParameters({
            collateralPrice,
            collateralToken,
            context,
            position,
            quotePrice,
            quoteToken,
            rpcProvider: context.rpcProvider,
            state,
            isFormValid,
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
    [context?.rpcProvider, dpmAddress, state, isExternalStep],
    250,
  )

  if (!txHelpers || !txData || !dpmAddress) {
    return () => console.warn('no txHelpers or txData or proxyAddress')
  }

  return () =>
    txHelpers
      .sendWithGasEstimation(callOasisActionsWithDpmProxy, {
        kind: TxMetaKind.libraryCall,
        proxyAddress: dpmAddress,
        ...txData,
      })
      .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
      .subscribe((txState) => {
        if (txState.status === TxStatus.WaitingForConfirmation)
          setCachedPosition({
            position,
            simulation,
          })
        if (txState.status === TxStatus.Success) dispatch({ type: 'reset' })
        handleTransaction({ txState, ethPrice, setTxDetails })
      })
}
