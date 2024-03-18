import { getNetworkContracts } from 'blockchain/contracts'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import type { AutomationFeatures } from 'features/automation/common/types'
import { useOmniAutomationTxHandler } from 'features/omni-kit/automation/hooks/useOmniAutomationTxHandler'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  getOmniAutomationPrimaryButtonLabelKey,
  getOmniSidebarButtonsStatus,
  getOmniSidebarPrimaryButtonActions,
  getOmniSidebarTransactionStatus,
} from 'features/omni-kit/helpers'
import { useOmniAutomationSidebarTitle } from 'features/omni-kit/hooks'
import { OmniSidebarAutomationStep } from 'features/omni-kit/types'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { TriggerAction } from 'helpers/triggers'
import { useAccount } from 'helpers/useAccount'
import { useHash } from 'helpers/useHash'
import { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Grid } from 'theme-ui'

interface OmniFormViewProps {
  dropdown?: SidebarSectionHeaderDropdown
  txSuccessAction?: () => void
}

export function OmniAutomationFormView({
  dropdown,
  children,
  txSuccessAction,
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
    automation: {
      commonForm: { state: commonFormState },
      automationForms,
    },
    position: { isSimulationLoading, resolvedId },
    dynamicMetadata: {
      featureToggles: { suppressValidation, safetySwitch },
      validations: { isFormFrozen, hasErrors },
      values: { sidebarTitle, automation },
    },
  } = useOmniProductContext(productType)

  const [hash] = useHash()
  const activeUiDropdown =
    hash === 'protection'
      ? commonFormState.uiDropdownProtection
      : commonFormState.uiDropdownOptimization

  const { state, dispatch } = automationForms[activeUiDropdown as `${AutomationFeatures}`]

  const isTriggerEnabled = activeUiDropdown && automation?.triggers[activeUiDropdown]

  const txHandler = useOmniAutomationTxHandler()

  const { connect, setChain } = useConnection()
  const { walletAddress } = useAccount()

  const genericSidebarTitle = useOmniAutomationSidebarTitle()

  const {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  } = getOmniSidebarButtonsStatus({
    currentStep,
    editingStep,
    hasErrors,
    isAllowanceLoading: false,
    isFormFrozen,
    isFormValid: true, // TODO add isFormValid resolver for automation
    isOpening,
    isOwner,
    isSimulationLoading,
    isTransitionInProgress: false,
    isTransitionWaitingForApproval: false,
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
    isTransitionAction: false,
    isTransitionWaitingForApproval: false,
    isTxSuccess,
    network,
    onConfirmTransition: () => null,
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
    if (currentStep === OmniSidebarAutomationStep.Manage && isTriggerEnabled) {
      dispatch({ type: 'reset' })
      dispatch({ type: 'partial-update', state: { action: TriggerAction.Remove } })
      setStep(OmniSidebarAutomationStep.Transaction)
      return
    }

    if (isTriggerEnabled && state?.action === TriggerAction.Remove) {
      dispatch({ type: 'partial-update', state: { action: TriggerAction.Update } })
      setStep(OmniSidebarAutomationStep.Manage)
      return
    }

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
      label:
        currentStep === OmniSidebarAutomationStep.Manage && state?.action === TriggerAction.Update
          ? t('system.remove-trigger')
          : t('back-to-editing'),
      action: textButtonAction,
      hidden:
        isTxInProgress ||
        (isTextButtonHidden &&
          currentStep === OmniSidebarAutomationStep.Manage &&
          !isTriggerEnabled),
    },
    status,
  }

  return <SidebarSection {...sidebarSectionProps} />
}
