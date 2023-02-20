import { TxStatus } from '@oasisdex/transactions'
import { AjnaActionData, AjnaTxData, getAjnaParameters } from 'actions/ajna'
import { callOasisActionsWithDpmProxy } from 'blockchain/calls/oasisActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { cancelable, CancelablePromise } from 'cancelable-promise'
import { useAppContext } from 'components/AppContextProvider'
import { useAjnaBorrowContext } from 'features/ajna/borrow/contexts/AjnaBorrowContext'
import { useAjnaGeneralContext } from 'features/ajna/contexts/AjnaGeneralContext'
import { takeUntilTxState } from 'features/automation/api/automationTxHandlers'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useEffect, useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

export interface OasisActionCallData extends AjnaTxData {
  kind: TxMetaKind.libraryCall
  proxyAddress: string
}

type AjnaTxHandler = () => void

export function useAjnaTxHandler(): AjnaTxHandler {
  const { txHelpers$, context$, uiChanges } = useAppContext()
  const [txHelpers] = useObservable(txHelpers$)
  const [context] = useObservable(context$)
  const {
    tx: { setTxDetails },
    environment: { collateralToken, quoteToken, ethPrice },
    steps: { isExternalStep },
  } = useAjnaGeneralContext()
  const {
    form: { dispatch, state },
    position: {
      currentPosition: { position, simulation },
      setCachedPosition,
      setIsLoadingSimulation,
      setSimulation,
    },
  } = useAjnaBorrowContext()

  const [txData, setTxData] = useState<AjnaTxData>()
  const [cancelablePromise, setCancelablePromise] = useState<CancelablePromise<AjnaActionData>>()

  const { depositAmount, generateAmount, paybackAmount, withdrawAmount, dpmAddress } = state

  useEffect(() => {
    cancelablePromise?.cancel()
    if (!depositAmount && !generateAmount && !paybackAmount && !withdrawAmount) {
      setSimulation(undefined)
      setIsLoadingSimulation(false)
    } else {
      setIsLoadingSimulation(true)
    }
  }, [
    context?.rpcProvider,
    dpmAddress,
    depositAmount?.toString(),
    generateAmount?.toString(),
    paybackAmount?.toString(),
    withdrawAmount?.toString(),
  ])
  useDebouncedEffect(
    () => {
      if (context && !isExternalStep) {
        const promise = cancelable(
          getAjnaParameters({
            rpcProvider: context.rpcProvider,
            formState: state,
            collateralToken,
            quoteToken,
            context,
            position,
          }),
        )
        setCancelablePromise(promise)

        promise
          .then((data) => {
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
          })
          .catch((error) => {
            setIsLoadingSimulation(false)
            console.error(error)
          })
      }
    },
    [
      context?.rpcProvider,
      dpmAddress,
      depositAmount?.toString(),
      generateAmount?.toString(),
      paybackAmount?.toString(),
      withdrawAmount?.toString(),
      isExternalStep,
    ],
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
