import { type TxMeta, type TxState } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { useMainContext } from 'components/context/MainContextProvider'
import { estimateOmniGas$, sendOmniTransaction$ } from 'features/omni-kit/observables'
import { useRefinanceContext } from 'features/refinance/contexts'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useEffect, useMemo } from 'react'

export const useRefinanceTxHandler = () => {
  const { connectedContext$ } = useMainContext()
  const [context] = useObservable(connectedContext$)
  const signer = context?.transactionProvider

  // from simulation hook
  const txData = useMemo(
    () => ({
      to: '0x6C7eD10997873b59c2B2D9449d9106fE1dD85784',
      data: '0xfcafcc680000000000000000000000000000000000000000000000000000000000007b9e000000000000000000000000f51d862200885a4732bab4c4b76188b33b3c5c8d',
      value: '0',
    }),
    [],
  )

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
  }, [currentStep])

  const proxyAddress = '0x6C7eD10997873b59c2B2D9449d9106fE1dD85784' || dpm?.address

  useEffect(() => {
    if (
      dpm &&
      signer &&
      [RefinanceSidebarStep.Give, RefinanceSidebarStep.Changes].includes(currentStep)
    ) {
      estimateOmniGas$({
        networkId: chainId,
        proxyAddress,
        signer,
        txData,
      }).subscribe((value) => setGasEstimation(value))
    }
  }, [dpm?.address, txData, chainId, signer, strategy, currentStep])

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
