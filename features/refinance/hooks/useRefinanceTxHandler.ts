import { type TxMeta, type TxState } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { useMainContext } from 'components/context/MainContextProvider'
import { estimateOmniGas$, sendOmniTransaction$ } from 'features/omni-kit/observables'
import { useRefinanceContext } from 'features/refinance/contexts'
import { mapTxInfoToOmniTxData } from 'features/refinance/helpers/mapTxInfoToOmniTxData'
import { useSdkRefinanceTransaction } from 'features/refinance/hooks/useSdkTransaction'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useEffect, useMemo } from 'react'
import type { TransactionInfo } from 'summerfi-sdk-common'

export const useRefinanceTxHandler = () => {
  const { connectedContext$ } = useMainContext()
  const [context] = useObservable(connectedContext$)
  const signer = context?.transactionProvider

  const {
    environment: {
      chainInfo: { chainId },
      ethPrice,
    },
    tx: { setTxDetails, setGasEstimation },
    form: {
      state: { dpm, strategy },
    },
    steps: { currentStep },
    simulation: { refinanceSimulation, importPositionSimulation },
  } = useRefinanceContext()

  useEffect(() => {
    setGasEstimation(undefined)
  }, [currentStep, setGasEstimation])

  const proxyAddress = dpm?.address

  const {
    error: transactionError,
    txImportPosition,
    txRefinance,
  } = useSdkRefinanceTransaction({
    refinanceSimulation,
    importPositionSimulation,
  })

  if (transactionError != null) {
    throw new Error(transactionError)
  }

  let txInfo: TransactionInfo | undefined
  switch (currentStep) {
    case RefinanceSidebarStep.Give:
      txInfo = txImportPosition?.transactions[0]
      break
    case RefinanceSidebarStep.Changes:
      txInfo = txRefinance?.transactions[0]
  }

  const txData = useMemo(() => mapTxInfoToOmniTxData(txInfo), [txInfo])

  useEffect(() => {
    if (
      dpm &&
      signer &&
      [RefinanceSidebarStep.Give, RefinanceSidebarStep.Changes].includes(currentStep) &&
      txData &&
      proxyAddress
    ) {
      estimateOmniGas$({
        networkId: chainId,
        proxyAddress,
        signer,
        txData,
        sendAsSinger: true,
      }).subscribe((value) => setGasEstimation(value))
    }
  }, [
    dpm?.address,
    txData,
    chainId,
    signer,
    strategy,
    currentStep,
    dpm,
    proxyAddress,
    setGasEstimation,
  ])

  if (!txData || !dpm || !signer?.provider || !proxyAddress) {
    return () => console.warn('no txData or proxyAddress or signer provider')
  }

  return () =>
    sendOmniTransaction$({
      signer,
      networkId: chainId,
      txData,
      proxyAddress,
      sendAsSinger: true,
    }).subscribe((txState) => {
      const castedTxState = txState as TxState<TxMeta>

      void handleTransaction({
        txState: castedTxState,
        ethPrice: new BigNumber(ethPrice),
        setTxDetails,
        networkId: chainId,
        txData: txData.data,
      })
    })
}
