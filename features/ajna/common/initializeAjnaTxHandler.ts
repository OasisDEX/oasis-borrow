import { TxStatus } from '@oasisdex/transactions'
import { AjnaActionData, AjnaSimulationData, AjnaTxData } from 'actions/ajna'
import { callOasisActionsWithDpmProxy } from 'blockchain/calls/oasisActions'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { Context } from 'blockchain/network'
import { cancelable, CancelablePromise } from 'cancelable-promise'
import { useAppContext } from 'components/AppContextProvider'
import { AjnaPositionSet } from 'features/ajna/common/types'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { takeUntilTxState } from 'features/automation/api/automationTxHandlers'
import { TX_DATA_CHANGE } from 'helpers/gasEstimate'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

export function initializeAjnaTxHandler<P>({
  setSimulation,
  setIsLoadingSimulation,
  setCachedPosition,
  dispatch,
  position,
  simulation,
  simulationCondition,
  dependencyArray,
  dpmAddress,
  getAjnaParametersCallback,
}: {
  setSimulation: Dispatch<SetStateAction<AjnaSimulationData<P> | undefined>>
  setIsLoadingSimulation: Dispatch<SetStateAction<boolean>>
  setCachedPosition: Dispatch<SetStateAction<AjnaPositionSet<P> | undefined>>
  dispatch: Dispatch<{ type: 'reset' }>
  position: P
  simulation?: P
  simulationCondition: boolean
  dependencyArray: unknown[]
  dpmAddress: string
  getAjnaParametersCallback: (context: Context) => Promise<AjnaActionData<P>>
}) {
  const { txHelpers$, context$, uiChanges } = useAppContext()
  const [txHelpers] = useObservable(txHelpers$)
  const [context] = useObservable(context$)
  const {
    tx: { setTxDetails },
    environment: { ethPrice },
    steps: { isExternalStep },
  } = useAjnaProductContext()

  const [txData, setTxData] = useState<AjnaTxData>()
  const [cancelablePromise, setCancelablePromise] = useState<CancelablePromise<AjnaActionData<P>>>()

  useEffect(() => {
    cancelablePromise?.cancel()
    if (simulationCondition) {
      setSimulation(undefined)
      setIsLoadingSimulation(false)
    } else {
      setIsLoadingSimulation(true)
    }
  }, [context?.rpcProvider, dpmAddress, ...dependencyArray])

  useDebouncedEffect(
    () => {
      if (context && !isExternalStep) {
        const promise = cancelable(getAjnaParametersCallback(context))
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
    [context?.rpcProvider, dpmAddress, ...dependencyArray, isExternalStep],
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
