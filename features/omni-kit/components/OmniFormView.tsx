import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { useMainContext } from 'components/context/MainContextProvider'
import { FlowSidebar } from 'components/FlowSidebar'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { ethers } from 'ethers'
import { AjnaDupePositionModal } from 'features/ajna/positions/common/components/AjnaDupePositionModal'
import { getFlowStateConfig } from 'features/ajna/positions/common/helpers/getFlowStateConfig'
import {
  ajnaFlowStateFilter,
  getAjnaFlowStateFilter,
} from 'features/ajna/positions/common/helpers/getFlowStateFilter'
import { useProductTypeTransition } from 'features/ajna/positions/common/hooks/useTransition'
import { getOmniPrimaryButtonLabelKey } from 'features/omni-kit/common/helpers/getOmniPrimaryButtonLabelKey'
import { getOmniSidebarButtonsStatus } from 'features/omni-kit/common/helpers/getOmniSidebarButtonsStatus'
import { getOmniSidebarPrimaryButtonActions } from 'features/omni-kit/common/helpers/getOmniSidebarPrimaryButtonActions'
import { getOmniSidebarTransactionStatus } from 'features/omni-kit/common/helpers/getOmniSidebarTransactionStatus'
import { useOmniGeneralContext } from 'features/omni-kit/contexts/OmniGeneralContext'
import { useOmniProductContext } from 'features/omni-kit/contexts/OmniProductContext'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { useAppConfig } from 'helpers/config'
import { useModalContext } from 'helpers/modalHook'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useFlowState } from 'helpers/useFlowState'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import type { PropsWithChildren } from 'react'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

interface AjnaFormViewProps {
  dropdown?: SidebarSectionHeaderDropdown
  txSuccessAction?: () => void
}

export function OmniFormView({
  dropdown,
  children,
  txSuccessAction,
}: PropsWithChildren<AjnaFormViewProps>) {
  // TODO to be moved to metadata
  const {
    AjnaSafetySwitch: ajnaSafetySwitchOn,
    AjnaSuppressValidation: ajnaSuppressValidationEnabled,
    AjnaReusableDPM: ajnaReusableDPMEnabled,
  } = useAppConfig('features')

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
      product,
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
  } = useOmniGeneralContext()
  const {
    form: { dispatch, state },
    position: {
      isSimulationLoading,
      resolvedId,
      currentPosition: { position },
    },
    dynamicMetadata,
  } = useOmniProductContext(product)

  const {
    handlers: { txHandler },
    values: { interestRate, sidebarTitle },
    validations: { isFormValid, isFormFrozen, hasErrors },
  } = dynamicMetadata(product)

  const { connect } = useConnection()
  const { walletAddress } = useAccount()
  const { openModal } = useModalContext()
  const [hasDupePosition, setHasDupePosition] = useState<boolean>(false)

  const flowState = useFlowState({
    ...(dpmProxy && { existingProxy: dpmProxy }),
    ...getFlowStateConfig({
      collateralToken,
      fee: interestRate,
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
  const {
    isTransitionAction,
    isTransitionInProgress,
    isTransitionWaitingForApproval,
    setisTransitionWaitingForApproval,
    transitionHandler,
  } = useProductTypeTransition({
    action: state.action,
    positionId: resolvedId,
    protocol: LendingProtocol.Ajna,
    product,
  })

  const {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  } = getOmniSidebarButtonsStatus({
    action: state.action,
    ajnaSafetySwitchOn,
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
    position,
    product,
    state,
    walletAddress,
  })
  const primaryButtonActions = getOmniSidebarPrimaryButtonActions({
    currentStep,
    editingStep,
    flow,
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
    resolvedId,
    walletAddress,
    product: product.toLowerCase(),
    isOracless,
    quoteAddress,
    collateralAddress,
    collateralToken,
    quoteToken,
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
      disabled: ajnaSuppressValidationEnabled ? false : isPrimaryButtonDisabled,
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
