import { type TxMeta, type TxState } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { useMainContext } from 'components/context/MainContextProvider'
import { estimateOmniGas$, sendOmniTransaction$ } from 'features/omni-kit/observables'
import { useRefinanceContext } from 'features/refinance/contexts'
import { mapTxInfoToOmniTxData } from 'features/refinance/helpers/mapTxInfoToOmniTxData'
import { useSdkSimulation } from 'features/refinance/hooks/useSdkSimulation'
import { useSdkRefinanceTransaction } from 'features/refinance/hooks/useSdkTransaction'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useEffect } from 'react'
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
  } = useRefinanceContext()

  useEffect(() => {
    setGasEstimation(undefined)
  }, [currentStep, setGasEstimation])

  // TODO for give tx it should be dsproxy, for refinance tx it should be dpm proxy
  const proxyAddress = '0x6C7eD10997873b59c2B2D9449d9106fE1dD85784' || dpm?.address

  const {
    error: simulationErrer,
    refinanceSimulation,
    importPositionSimulation,
  } = useSdkSimulation()
  const {
    error: transactionError,
    txImportPosition,
    txRefinance,
  } = useSdkRefinanceTransaction({
    refinanceSimulation,
    importPositionSimulation,
  })

  if (simulationErrer != null) {
    throw new Error(simulationErrer)
  }
  if (transactionError != null) {
    throw new Error(transactionError)
  }

  let txInfo: TransactionInfo | undefined
  switch (currentStep) {
    case RefinanceSidebarStep.Give:
      txInfo = txImportPosition?.transactions[0]
      break
    case RefinanceSidebarStep.Transaction:
      txInfo = txRefinance?.transactions[0]
  }

  const txData = mapTxInfoToOmniTxData(txInfo)

  useEffect(() => {
    if (
      dpm &&
      signer &&
      [RefinanceSidebarStep.Give, RefinanceSidebarStep.Changes].includes(currentStep) &&
      txData
    ) {
      estimateOmniGas$({
        networkId: chainId,
        proxyAddress,
        signer,
        txData,
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

  if (!txData || !dpm || !signer?.provider) {
    return () => console.warn('no txData or proxyAddress or signer provider')
  }

  return () =>
    sendOmniTransaction$({
      signer,
      networkId: chainId,
      txData,
      proxyAddress,
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
