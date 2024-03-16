import type { TxMeta, TxState } from '@oasisdex/transactions'
import { TxStatus } from '@oasisdex/transactions'
import type { CancelablePromise } from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import { useMainContext } from 'components/context/MainContextProvider'
import { ethers } from 'ethers'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniGetAutomationDataParams } from 'features/omni-kit/automation/helpers'
import {
  getOmniAutomationParameters,
  isOmniAutomationFormEmpty,
} from 'features/omni-kit/automation/helpers'
import type { OmniAutomationSimulationResponse } from 'features/omni-kit/contexts'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { OmniTxData } from 'features/omni-kit/hooks'
import { estimateOmniGas$, sendOmniTransaction$ } from 'features/omni-kit/observables'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useHash } from 'helpers/useHash'
import { useEffect, useState } from 'react'

export const useOmniAutomationTxHandler = () => {
  const { connectedContext$ } = useMainContext()
  const [context] = useObservable(connectedContext$)
  const signer = context?.transactionProvider

  const {
    tx: { setTxDetails, setGasEstimation },
    environment: {
      ethPrice,
      productType,
      networkId,
      protocol,
      collateralAddress,
      quoteAddress,
      dpmProxy,
      isShort,
    },
  } = useOmniGeneralContext()
  const {
    automation: {
      setSimulation,
      setIsLoadingSimulation,
      commonForm: { state: commonState },
      automationForms,
    },
    dynamicMetadata: {
      values: { automation },
    },
  } = useOmniProductContext(productType)

  const [hash] = useHash()

  const activeUiDropdown =
    hash === 'protection'
      ? commonState.uiDropdownProtection || AutomationFeatures.TRAILING_STOP_LOSS
      : commonState.uiDropdownOptimization || AutomationFeatures.PARTIAL_TAKE_PROFIT

  const { state, dispatch } = automationForms[activeUiDropdown as `${AutomationFeatures}`]

  const isFormEmpty = isOmniAutomationFormEmpty(state, activeUiDropdown)

  const [txData, setTxData] = useState<OmniTxData>()
  const [cancelablePromise, setCancelablePromise] =
    useState<CancelablePromise<OmniAutomationSimulationResponse | undefined>>()

  const automationParameters = getOmniAutomationParameters({
    proxyAddress: dpmProxy,
    networkId,
    protocol,
    collateralAddress,
    debtAddress: quoteAddress,
    automation,
    data: {
      activeUiDropdown,
      automationState: state,
    } as OmniGetAutomationDataParams,
    isShort,
  })

  useEffect(() => {
    cancelablePromise?.cancel()

    if (isFormEmpty) {
      setSimulation(undefined)
      setIsLoadingSimulation(false)
      setGasEstimation(undefined)
    } else {
      setGasEstimation(undefined)
      setIsLoadingSimulation(true)
    }
  }, [state, isFormEmpty])

  useDebouncedEffect(
    () => {
      if (!isFormEmpty) {
        const promise = cancelable(automationParameters())
        setCancelablePromise(promise)

        promise
          .then((data) => {
            if (data?.transaction && signer && dpmProxy) {
              const txDataFromResponse = {
                ...data.transaction,
                value: ethers.utils.parseEther('0').toHexString(),
              }

              setTxData(txDataFromResponse)
              setSimulation(data)
              setIsLoadingSimulation(false)
              estimateOmniGas$({
                networkId,
                proxyAddress: dpmProxy,
                signer,
                txData: txDataFromResponse,
                sendAsSinger: true,
              }).subscribe((value) => setGasEstimation(value))
            }
          })
          .catch((error) => {
            setIsLoadingSimulation(false)
            console.error(error)
          })
      }
    },
    [state, signer],
    250,
  )

  if (!txData || !dpmProxy || !signer?.provider) {
    return () => console.warn('no txData or proxyAddress or signer provider')
  }

  return () =>
    sendOmniTransaction$({
      signer,
      networkId,
      txData,
      proxyAddress: dpmProxy,
      sendAsSinger: true,
    }).subscribe((txState) => {
      if (txState.status === TxStatus.Success) {
        // TODO dispatch specific form action
        dispatch({ type: 'reset' })
      }

      const castedTxState = txState as TxState<TxMeta>

      void handleTransaction({
        txState: castedTxState,
        ethPrice,
        setTxDetails,
        networkId,
        txData: txData.data,
      })
    })
}
