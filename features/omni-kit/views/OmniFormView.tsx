import { getNetworkContracts } from 'blockchain/contracts'
import { FlowSidebar } from 'components/FlowSidebar'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import {
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { ethers } from 'ethers'
import { OmniDupePositionModal } from 'features/omni-kit/components'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  getOmniFilterConsumedProxy,
  getOmniFlowStateConfig,
  getOmniPrimaryButtonLabelKey,
  getOmniSidebarButtonsStatus,
  getOmniSidebarPrimaryButtonActions,
  getOmniSidebarTransactionStatus,
} from 'features/omni-kit/helpers'
import { useOmniProductTypeTransition, useOmniSidebarTitle } from 'features/omni-kit/hooks'
import { OmniSidebarStep } from 'features/omni-kit/types'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { getLocalAppConfig } from 'helpers/config'
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
      entryToken,
      isOpening,
      isOracless,
      isOwner,
      label,
      network,
      networkId,
      pairId,
      productType,
      protocol,
      pseudoProtocol,
      quoteAddress,
      quotePrecision,
      quoteToken,
      settings,
      shouldSwitchNetwork,
      positionId,
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
    position: { isSimulationLoading, openFlowResolvedDpmId },
    dynamicMetadata: {
      elements: { sidebarContent },
      featureToggles: { suppressValidation, safetySwitch },
      filters: { omniProxyFilter },
      theme,
      validations: { isFormValid, isFormFrozen, hasErrors },
      values: { interestRate, sidebarTitle },
    },
  } = useOmniProductContext(productType)

  const txHandler = _txHandler()

  const { connect, setChain } = useConnection()
  const { walletAddress } = useAccount()
  const { openModal } = useModalContext()
  const [hasDupePosition, setHasDupePosition] = useState<boolean>(false)
  const { OmniKitDebug } = getLocalAppConfig('features')

  const genericSidebarTitle = useOmniSidebarTitle()

  const flowState = useFlowState({
    pairId,
    protocol,
    networkId,
    ...(dpmProxy && positionId && { existingProxy: { address: dpmProxy, id: positionId } }),
    ...getOmniFlowStateConfig({
      protocol,
      collateralToken,
      entryToken: entryToken.symbol,
      fee: interestRate,
      isOpening,
      quoteToken,
      state,
      quotePrecision,
    }),
    filterConsumedProxy: async (events) => getOmniFilterConsumedProxy(events, omniProxyFilter),
    onProxiesAvailable: async (events, dpmAccounts) => {
      const filteredEventsBooleanMap = await Promise.all(
        events.map((event) => omniProxyFilter({ event, allEvents: events })),
      )
      const filteredEvents = events.filter(
        (_event, eventIndex) => filteredEventsBooleanMap[eventIndex],
      )
      if (!hasDupePosition && filteredEvents.length) {
        setHasDupePosition(true)
        openModal(OmniDupePositionModal, {
          collateralAddress,
          collateralToken,
          dpmAccounts,
          events: filteredEvents,
          isOracless,
          label,
          networkId,
          pairId,
          productType,
          protocol,
          pseudoProtocol,
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
    positionId: positionId || openFlowResolvedDpmId,
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
    isFlowSidebarUiLoading: flowState.isUiDataLoading,
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
    uiDropdown: state.uiDropdown,
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
    label,
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
    pairId,
    productType,
    protocol,
    pseudoProtocol,
    quoteAddress,
    quoteToken,
    shouldSwitchNetwork,
    openFlowResolvedDpmId,
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
    title: sidebarTitle ?? genericSidebarTitle,
    dropdown,
    content: (
      <Grid gap={3}>
        {sidebarContent}
        {children}
        {OmniKitDebug && openFlowResolvedDpmId && (
          <VaultChangesInformationContainer title="DPM debug data">
            <VaultChangesInformationItem label="DPM ID" value={openFlowResolvedDpmId} />
            <VaultChangesInformationItem
              label="Address"
              value={
                flowState.availableProxies.length
                  ? flowState.availableProxies[0]
                  : ethers.constants.AddressZero
              }
            />
          </VaultChangesInformationContainer>
        )}
      </Grid>
    ),
    primaryButton: {
      label: t(primaryButtonLabel, { token: flowState.token }),
      disabled: suppressValidation ? false : isPrimaryButtonDisabled,
      isLoading: isPrimaryButtonLoading,
      hidden: isPrimaryButtonHidden,
      withoutNextLink: true,
      ...primaryButtonActions,
    },
    textButton: {
      label: t('back-to-editing'),
      action: textButtonAction,
      hidden: isTextButtonHidden,
    },
    status,
    disableMaxHeight: !!(settings.pullTokens?.[networkId] || settings.returnTokens?.[networkId]),
  }

  useEffect(() => {
    dispatch({
      type: 'update-dpm',
      dpmAddress: flowState.availableProxies.length
        ? flowState.availableProxies[0].address
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
