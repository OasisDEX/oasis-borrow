import { getNetworkContracts } from 'blockchain/contracts'
import { FlowSidebar } from 'components/FlowSidebar'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { ethers } from 'ethers'
import { OmniDupePositionModal } from 'features/omni-kit/components'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  getOmniFlowStateConfig,
  getOmniPrimaryButtonLabelKey,
  getOmniSidebarButtonsStatus,
  getOmniSidebarPrimaryButtonActions,
  getOmniSidebarTransactionStatus,
} from 'features/omni-kit/helpers'
import { useOmniProductTypeTransition } from 'features/omni-kit/hooks'
import { OmniSidebarStep } from 'features/omni-kit/types'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { useModalContext } from 'helpers/modalHook'
import { useAccount } from 'helpers/useAccount'
import { useFlowState } from 'helpers/useFlowState'
import { LendingProtocolLabel } from 'lendingProtocols'
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

  const {
    environment: {
      collateralAddress,
      collateralToken,
      dpmProxy,
      isOpening,
      isOracless,
      isOwner,
      productType,
      quoteAddress,
      quoteToken,
      protocol,
      shouldSwitchNetwork,
      network,
      networkId,
      quotePrecision,
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
      values: { interestRate, sidebarTitle },
      validations: { isFormValid, isFormFrozen, hasErrors },
      filters: { flowStateFilter },
      featureToggles: { suppressValidation, safetySwitch },
      theme,
    },
  } = useOmniProductContext(productType)

  const txHandler = _txHandler()

  const { connect, setChain } = useConnection()
  const { walletAddress } = useAccount()
  const { openModal } = useModalContext()
  const [hasDupePosition, setHasDupePosition] = useState<boolean>(false)

  const flowState = useFlowState({
    networkId,
    ...(dpmProxy && { existingProxy: dpmProxy }),
    ...getOmniFlowStateConfig({
      protocol,
      collateralToken,
      fee: interestRate,
      isOpening,
      quoteToken,
      state,
      quotePrecision,
    }),
    filterConsumedProxy: (events) => events.every((event) => !flowStateFilter(event)),
    onProxiesAvailable: (events, dpmAccounts) => {
      const filteredEvents = events.filter(flowStateFilter)

      if (!hasDupePosition && filteredEvents.length) {
        setHasDupePosition(true)
        openModal(OmniDupePositionModal, {
          collateralAddress,
          collateralToken,
          dpmAccounts,
          events: filteredEvents,
          isOracless,
          networkId,
          productType,
          protocol,
          quoteAddress,
          quoteToken,
          theme,
          walletAddress,
        })
      }
    },
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
    tokenPair: `${collateralToken}-${quoteToken}`,
  })

  const {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  } = getOmniSidebarButtonsStatus({
    action: state.action,
    currentStep,
    editingStep,
    hasErrors,
    isAllowanceLoading: flowState.isLoading,
    isFormFrozen,
    isFormValid,
    isOpening,
    isOwner,
    isSimulationLoading,
    isTransitionInProgress,
    isTransitionWaitingForApproval,
    isTxError,
    isTxInProgress,
    isTxStarted,
    isTxWaitingForApproval,
    safetySwitch,
    shouldSwitchNetwork,
    walletAddress,
  })
  const primaryButtonLabel = getOmniPrimaryButtonLabelKey({
    currentStep,
    hasAllowance: flowState.isAllowanceReady,
    hasDpmAddress: flowState.isProxyReady,
    isOpening,
    isTransitionInProgress,
    isTxError,
    isTxSuccess,
    shouldSwitchNetwork,
    walletAddress,
  })
  const primaryButtonActions = getOmniSidebarPrimaryButtonActions({
    collateralAddress,
    collateralToken,
    currentStep,
    editingStep,
    isOpening,
    isOracless,
    isStepWithTransaction,
    isTransitionAction,
    isTransitionWaitingForApproval,
    isTxSuccess,
    network,
    onConfirmTransition: transitionHandler,
    onDefault: setNextStep,
    onDisconnected: connect,
    onSelectTransition: txHandler,
    onTransition: () => {
      setStep(OmniSidebarStep.Transition)
      setisTransitionWaitingForApproval(true)
    },
    onUpdated: () => {
      setTxDetails(undefined)
      setStep(editingStep)
      txSuccessAction && txSuccessAction()
    },
    onSwitchNetwork: () => setChain(network.hexId),
    productType,
    protocol,
    quoteAddress,
    quoteToken,
    shouldSwitchNetwork,
    resolvedId,
    walletAddress,
  })
  const textButtonAction = () => {
    setisTransitionWaitingForApproval(false)
    setStep(editingStep)
  }
  const status = getOmniSidebarTransactionStatus({
    etherscan: getNetworkContracts(networkId).etherscan.url,
    etherscanName: getNetworkContracts(networkId).etherscan.name,
    isTxInProgress,
    isTxSuccess,
    text: t(
      isTxSuccess
        ? `omni-kit.form.transaction.success-${isOpening ? 'open' : 'manage'}`
        : `omni-kit.form.transaction.progress-${isOpening ? 'open' : 'manage'}`,
      { collateralToken, quoteToken, productType, protocol: LendingProtocolLabel[protocol] },
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
        <>{currentStep === OmniSidebarStep.Dpm && <FlowSidebar {...flowState} />}</>
      )}
    </>
  )
}
