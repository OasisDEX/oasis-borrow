import type { TxMeta, TxState } from '@oasisdex/transactions'
import { TxStatus } from '@oasisdex/transactions'
import type { CancelablePromise } from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import { useMainContext } from 'components/context/MainContextProvider'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar.types'
import { ethers } from 'ethers'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniGetAutomationDataParams } from 'features/omni-kit/automation/helpers'
import { getOmniAutomationParameters } from 'features/omni-kit/automation/helpers'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { OmniTxData } from 'features/omni-kit/hooks'
import { estimateOmniGas$, sendOmniTransaction$ } from 'features/omni-kit/observables'
import type { OmniAutomationSimulationResponse } from 'features/omni-kit/types'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { useHash } from 'helpers/useHash'
import { useEffect, useMemo, useState } from 'react'

export const useOmniAutomationTxHandler = () => {
  const { connectedContext$ } = useMainContext()
  const [context] = useObservable(connectedContext$)
  const signer = context?.transactionProvider

  const {
    tx: { setTxDetails, setGasEstimation },
    environment: {
      collateralAddress,
      dpmProxy,
      ethPrice,
      isShort,
      networkId,
      poolId,
      productType,
      protocol,
      quoteAddress,
    },
  } = useOmniGeneralContext()
  const {
    automation: {
      setSimulation,
      setIsLoadingSimulation,
      commonForm: { state: commonState, updateState: updateCommonState },
    },
    dynamicMetadata: {
      values: { automation },
    },
  } = useOmniProductContext(productType)

  if (!automation) {
    throw new Error('Automation dynamic metadata not available')
  }

  const { activeUiDropdown, activeForm } = automation.resolved

  const [, updateHash] = useHash()

  const { state, dispatch } = activeForm

  const isFormEmpty = automation.resolved.isFormEmpty

  const [txData, setTxData] = useState<OmniTxData>()
  const [cancelablePromise, setCancelablePromise] =
    useState<CancelablePromise<OmniAutomationSimulationResponse | undefined>>()

  const automationParameters = getOmniAutomationParameters({
    automation,
    collateralAddress,
    data: {
      activeUiDropdown,
      automationState: state,
    } as OmniGetAutomationDataParams,
    debtAddress: quoteAddress,
    isShort,
    networkId,
    poolId,
    protocol,
    proxyAddress: dpmProxy,
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
      updateCommonState('activeTxUiDropdown', activeUiDropdown)
      updateCommonState('activeAction', state.action)
    }
  }, [state, isFormEmpty])

  useDebouncedEffect(
    () => {
      if (!isFormEmpty) {
        const promise = cancelable(automationParameters())
        setCancelablePromise(promise)

        promise
          .then((data) => {
            if (data && signer && dpmProxy) {
              if (data.transaction) {
                const txDataFromResponse = {
                  ...data.transaction,
                  value: ethers.utils.parseEther('0').toHexString(),
                }
                setTxData(txDataFromResponse)
                estimateOmniGas$({
                  networkId,
                  proxyAddress: dpmProxy,
                  signer,
                  txData: txDataFromResponse,
                  sendAsSinger: true,
                }).subscribe((value) => setGasEstimation(value))
              }

              setSimulation(data)
              setIsLoadingSimulation(false)
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

  // Callback to redirect user back to given auto feature UI for which Tx was in progress
  const onTxEndCallback = useMemo(() => {
    if (!commonState.activeTxUiDropdown) {
      return () => null
    }

    return {
      [AutomationFeatures.STOP_LOSS]: () => {
        updateHash(VaultViewMode.Protection, true)
        updateCommonState('uiDropdownProtection', AutomationFeatures.STOP_LOSS)
      },
      [AutomationFeatures.AUTO_BUY]: () => {
        updateHash(VaultViewMode.Optimization, true)
        updateCommonState('uiDropdownProtection', AutomationFeatures.AUTO_BUY)
      },
      [AutomationFeatures.AUTO_SELL]: () => {
        updateHash(VaultViewMode.Protection, true)
        updateCommonState('uiDropdownProtection', AutomationFeatures.AUTO_SELL)
      },
      [AutomationFeatures.AUTO_TAKE_PROFIT]: () => {
        updateHash(VaultViewMode.Optimization, true)
        updateCommonState('uiDropdownProtection', AutomationFeatures.AUTO_TAKE_PROFIT)
      },
      [AutomationFeatures.TRAILING_STOP_LOSS]: () => {
        updateHash(VaultViewMode.Protection, true)
        updateCommonState('uiDropdownProtection', AutomationFeatures.TRAILING_STOP_LOSS)
      },
      [AutomationFeatures.PARTIAL_TAKE_PROFIT]: () => {
        updateHash(VaultViewMode.Optimization, true)
        updateCommonState('uiDropdownProtection', AutomationFeatures.PARTIAL_TAKE_PROFIT)
      },
    }[commonState.activeTxUiDropdown]
  }, [commonState.activeTxUiDropdown])

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
      onError: () => {
        onTxEndCallback()
      },
    }).subscribe((txState) => {
      if (txState.status === TxStatus.Success) {
        dispatch({ type: 'reset' })
        onTxEndCallback()
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
