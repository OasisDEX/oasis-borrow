import { useMainContext } from 'components/context/MainContextProvider'
import { getFlowStateConfig } from 'features/ajna/positions/common/helpers/getFlowStateConfig'
import { useAjnaTxHandler } from 'features/ajna/positions/common/hooks/useAjnaTxHandler'
import { useOmniKitContext } from 'features/omni-kit/contexts/OmniKitContext'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useFlowState } from 'helpers/useFlowState'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function OmniKitFormController() {
  const { t } = useTranslation()

  const { context$ } = useMainContext()

  const txHandler = useAjnaTxHandler()
  const { connect } = useConnection()
  const { walletAddress } = useAccount()

  const [context] = useObservable(context$)

  const {
    environment: {
      collateralAddress,
      collateralToken,
      dpmProxy,
      flow,
      isOracless,
      isOwner,
      productType,
      quoteAddress,
      quoteToken,
    },
    steps: {
      currentStep,
      editingStep,
      isExternalStep,
      isStepWithTransaction,
      setIsFlowStateReady,
      setNextStep,
      setStep,
    },
    tx: {
      isTxError,
      isTxSuccess,
      isTxWaitingForApproval,
      isTxStarted,
      isTxInProgress,
      setTxDetails,
      txDetails,
    },
  } = useOmniKitContext()

  const flowState = useFlowState({
    ...(dpmProxy && { existingProxy: dpmProxy }),
    ...getFlowStateConfig({
      collateralToken,
      fee: position.pool.interestRate,
      flow,
      quoteToken,
      state,
    }),
    ...(ajnaReusableDPMEnabled && {
      filterConsumedProxy: (events) =>
        getAjnaFlowStateFilter({
          collateralAddress,
          events,
          product,
          quoteAddress,
        }),
      onProxiesAvailable: (events, dpmAccounts) => {
        const filteredEvents = events.filter((event) =>
          ajnaFlowStateFilter({ collateralAddress, event, product, quoteAddress }),
        )

        if (!hasDupePosition && filteredEvents.length) {
          setHasDupePosition(true)
          openModal(AjnaDupePositionModal, {
            chainId: context?.chainId,
            collateralAddress,
            collateralToken,
            dpmAccounts,
            events: filteredEvents,
            product,
            quoteAddress,
            quoteToken,
            walletAddress,
          })
        }
      },
    }),
    onEverythingReady: () => setNextStep(),
    onGoBack: () => setStep(editingStep),
  })

  return <>Form</>
}
