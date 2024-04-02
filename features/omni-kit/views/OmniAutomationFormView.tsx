import { getNetworkContracts } from 'blockchain/contracts'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { isOmniAutomationFormValid } from 'features/omni-kit/automation/helpers'
import { useOmniAutomationTxHandler } from 'features/omni-kit/automation/hooks/useOmniAutomationTxHandler'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import {
  getOmniAutomationPrimaryButtonLabelKey,
  getOmniAutomationSidebarButtonsStatus,
  getOmniAutomationSidebarPrimaryButtonActions,
  getOmniSidebarTransactionStatus,
} from 'features/omni-kit/helpers'
import { useOmniAutomationSidebarTitle } from 'features/omni-kit/hooks'
import { OmniSidebarAutomationStep } from 'features/omni-kit/types'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { TriggerAction } from 'helpers/triggers'
import { useAccount } from 'helpers/useAccount'
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
      isSimulationLoading,
      commonForm: { updateState: updateCommonState },
      simulationData,
      setSimulation,
      setCachedOrderInfoItems,
    },
    position: { openFlowResolvedDpmId },
    dynamicMetadata: {
      featureToggles: { suppressValidation, safetySwitch },
      validations: { isFormFrozen },
      values: { sidebarTitle, automation },
    },
  } = useOmniProductContext(productType)

  if (!automation) {
    throw new Error('Automation dynamic metadata not available')
  }

  const { activeForm, activeUiDropdown } = automation.resolved

  const { state, dispatch } = activeForm

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
  } = getOmniAutomationSidebarButtonsStatus({
    currentStep,
    editingStep,
    hasErrors: !!simulationData?.errors?.length,
    isFormFrozen,
    isFormValid: isOmniAutomationFormValid(state, activeUiDropdown),
    isOpening,
    isOwner,
    isSimulationLoading,
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
  const primaryButtonActions = getOmniAutomationSidebarPrimaryButtonActions({
    collateralAddress,
    collateralToken,
    currentStep,
    editingStep,
    isOpening,
    isOracless,
    isStepWithTransaction,
    isTxSuccess,
    network,
    onDefault: setNextStep,
    onDisconnected: connect,
    onSelectTransition: txHandler,
    onUpdated: () => {
      setCachedOrderInfoItems(undefined)
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
    openFlowResolvedDpmId,
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
      setSimulation(undefined)
      dispatch({ type: 'partial-update', state: { action: TriggerAction.Update } })
      updateCommonState('activeAction', undefined)
      updateCommonState('activeTxUiDropdown', undefined)
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
      disabled: suppressValidation || isTxSuccess ? false : isPrimaryButtonDisabled,
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
        isTxSuccess ||
        (isTextButtonHidden &&
          currentStep === OmniSidebarAutomationStep.Manage &&
          !isTriggerEnabled),
    },
    status,
  }

  return <SidebarSection {...sidebarSectionProps} />
}
