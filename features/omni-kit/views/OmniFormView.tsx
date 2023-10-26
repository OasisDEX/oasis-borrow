import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { useMainContext } from 'components/context/MainContextProvider'
import { FlowSidebar } from 'components/FlowSidebar'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { ethers } from 'ethers'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  getOmniFlowStateConfig,
  getOmniPrimaryButtonLabelKey,
  getOmniSidebarButtonsStatus,
  getOmniSidebarPrimaryButtonActions,
  getOmniSidebarTransactionStatus,
} from 'features/omni-kit/helpers'
import { useOmniProductTypeTransition } from 'features/omni-kit/hooks/useOmniTransition'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { useModalContext } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useFlowState } from 'helpers/useFlowState'
import { useTranslation } from 'next-i18next'
import type { PropsWithChildren } from 'react'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

interface OmniFormViewProps {
  dropdown?: SidebarSectionHeaderDropdown
  txSuccessAction?: () => void
  txHandler: () => () => void
}

export function OmniFormView({
  dropdown,
  children,
  txSuccessAction,
  txHandler: _txHandler,
}: PropsWithChildren<OmniFormViewProps>) {
  const { t } = useTranslation()
  const { context$ } = useMainContext()

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
      protocol,
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
  } = useOmniGeneralContext()
  const {
    form: { dispatch, state },
    position: { isSimulationLoading, resolvedId },
    dynamicMetadata: {
      values: { interestRate, sidebarTitle, isFormEmpty },
      validations: { isFormValid, isFormFrozen, hasErrors },
      filters: { flowStateFilter, consumedProxyFilter },
      elements: { dupeModal },
      featureToggles: { suppressValidation, safetySwitch, reusableDpm },
    },
  } = useOmniProductContext(productType)

  const txHandler = _txHandler()

  const { connect } = useConnection()
  const { walletAddress } = useAccount()
  const { openModal } = useModalContext()
  const [hasDupePosition, setHasDupePosition] = useState<boolean>(false)

  const flowState = useFlowState({
    ...(dpmProxy && { existingProxy: dpmProxy }),
    ...getOmniFlowStateConfig({
      collateralToken,
      fee: interestRate,
      flow,
      quoteToken,
      state,
    }),
    ...(reusableDpm && {
      filterConsumedProxy: (events) => events.every(consumedProxyFilter),
      onProxiesAvailable: (events, dpmAccounts) => {
        const filteredEvents = events.filter(flowStateFilter)

        if (!hasDupePosition && filteredEvents.length) {
          setHasDupePosition(true)
          openModal(dupeModal, {
            chainId: context?.chainId,
            collateralAddress,
            collateralToken,
            dpmAccounts,
            events: filteredEvents,
            productType,
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
  const {
    isTransitionAction,
    isTransitionInProgress,
    isTransitionWaitingForApproval,
    setisTransitionWaitingForApproval,
    transitionHandler,
  } = useOmniProductTypeTransition({
    action: state.action,
    positionId: resolvedId,
    protocol,
    productType,
  })

  const {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  } = getOmniSidebarButtonsStatus({
    action: state.action,
    safetySwitch,
    currentStep,
    editingStep,
    flow,
    hasErrors,
    isFormFrozen,
    isAllowanceLoading: flowState.isLoading,
    isFormValid,
    isOwner,
    isSimulationLoading,
    isTransitionInProgress,
    isTransitionWaitingForApproval,
    isTxError,
    isTxInProgress,
    isTxStarted,
    isTxWaitingForApproval,
    walletAddress,
  })
  const primaryButtonLabel = getOmniPrimaryButtonLabelKey({
    currentStep,
    flow,
    hasAllowance: flowState.isAllowanceReady,
    hasDpmAddress: flowState.isProxyReady,
    isTransitionInProgress,
    isTxError,
    isTxSuccess,
    walletAddress,
    isFormEmpty,
  })
  const primaryButtonActions = getOmniSidebarPrimaryButtonActions({
    collateralAddress,
    collateralToken,
    currentStep,
    editingStep,
    flow,
    isOracless,
    isStepWithTransaction,
    isTransitionAction,
    isTransitionWaitingForApproval,
    isTxSuccess,
    onConfirmTransition: transitionHandler,
    onDefault: setNextStep,
    onDisconnected: connect,
    onSelectTransition: txHandler,
    onTransition: () => {
      setStep('transition')
      setisTransitionWaitingForApproval(true)
    },
    onUpdated: () => {
      setTxDetails(undefined)
      setStep(editingStep)
      txSuccessAction && txSuccessAction()
    },
    productType,
    protocol,
    quoteAddress,
    quoteToken,
    resolvedId,
    walletAddress,
  })
  const textButtonAction = () => {
    setisTransitionWaitingForApproval(false)
    setStep(editingStep)
  }
  const status = getOmniSidebarTransactionStatus({
    etherscan: context && getNetworkContracts(NetworkIds.MAINNET, context.chainId).etherscan.url,
    isTxInProgress,
    isTxSuccess,
    text: t(
      isTxSuccess
        ? `ajna.position-page.common.form.transaction.success-${flow}`
        : `ajna.position-page.common.form.transaction.progress-${flow}`,
      { collateralToken, quoteToken },
    ),
    txDetails,
  })

  const sidebarSectionProps: SidebarSectionProps = {
    title: sidebarTitle,
    dropdown,
    content: <Grid gap={3}>{children}</Grid>,
    primaryButton: {
      label: t(primaryButtonLabel, { token: flowState.token }),
      disabled: suppressValidation ? false : isPrimaryButtonDisabled,
      isLoading: isPrimaryButtonLoading,
      hidden: isPrimaryButtonHidden,
      ...primaryButtonActions,
    },
    textButton: {
      label: t('back-to-editing'),
      action: textButtonAction,
      hidden: isTextButtonHidden,
    },
    status,
  }

  useEffect(() => {
    dispatch({
      type: 'update-dpm',
      dpmAddress: flowState.availableProxies.length
        ? flowState.availableProxies[0]
        : ethers.constants.AddressZero,
    })
  }, [flowState.availableProxies])
  useEffect(() => setIsFlowStateReady(flowState.isEverythingReady), [flowState.isEverythingReady])

  return (
    <>
      {!isExternalStep ? (
        <SidebarSection {...sidebarSectionProps} />
      ) : (
        <>{currentStep === 'dpm' && <FlowSidebar {...flowState} />}</>
      )}
    </>
  )
}
