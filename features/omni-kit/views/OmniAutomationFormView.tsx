import { getNetworkContracts } from 'blockchain/contracts'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  getOmniAutomationPrimaryButtonLabelKey,
  getOmniSidebarButtonsStatus,
  getOmniSidebarPrimaryButtonActions,
  getOmniSidebarTransactionStatus,
} from 'features/omni-kit/helpers'
import {
  useOmniAutomationSidebarTitle,
  useOmniProductTypeTransition,
} from 'features/omni-kit/hooks'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { useAccount } from 'helpers/useAccount'
import { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Grid } from 'theme-ui'

interface OmniFormViewProps {
  dropdown?: SidebarSectionHeaderDropdown
  txSuccessAction?: () => void
  txHandler: () => () => void
}

export function OmniAutomationFormView({
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
    },
    automationSteps: { currentStep, editingStep, isStepWithTransaction, setNextStep, setStep },
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
      elements: { sidebarContent },
      featureToggles: { suppressValidation, safetySwitch },
      filters: { flowStateFilter },
      theme,
      validations: { isFormValid, isFormFrozen, hasErrors },
      values: { interestRate, sidebarTitle },
    },
  } = useOmniProductContext(productType)

  const txHandler = _txHandler()

  const { connect, setChain } = useConnection()
  const { walletAddress } = useAccount()

  const genericSidebarTitle = useOmniAutomationSidebarTitle()

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
    isAllowanceLoading: false,
    isFormFrozen,
    isFormValid: true, // TODO add isFormValid resolver for automation
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
  const primaryButtonLabel = getOmniAutomationPrimaryButtonLabelKey({
    currentStep,
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
    onTransition: () => null,
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
    title: sidebarTitle ?? genericSidebarTitle,
    dropdown,
    content: <Grid gap={3}>{children}</Grid>,
    primaryButton: {
      label: t(primaryButtonLabel),
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
  }

  return <SidebarSection {...sidebarSectionProps} />
}
