import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { useAppContext } from 'components/AppContextProvider'
import { FlowSidebar } from 'components/FlowSidebar'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { ethers } from 'ethers'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { getAjnaSidebarTitle } from 'features/ajna/positions/common/getAjnaSidebarTitle'
import { getAjnaSidebarButtonsStatus } from 'features/ajna/positions/common/helpers/getAjnaSidebarButtonsStatus'
import { getAjnaSidebarPrimaryButtonActions } from 'features/ajna/positions/common/helpers/getAjnaSidebarPrimaryButtonActions'
import { getAjnaSidebarTransactionStatus } from 'features/ajna/positions/common/helpers/getAjnaSidebarTransactionStatus'
import { getFlowStateConfig } from 'features/ajna/positions/common/helpers/getFlowStateConfig'
import { getPrimaryButtonLabelKey } from 'features/ajna/positions/common/helpers/getPrimaryButtonLabelKey'
import { useAjnaTxHandler } from 'features/ajna/positions/common/hooks/useAjnaTxHandler'
import { useProductTypeTransition } from 'features/ajna/positions/common/hooks/useTransition'
import { useConnection } from 'features/web3OnBoard'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useFlowState } from 'helpers/useFlowState'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React, { PropsWithChildren, useEffect } from 'react'
import { Grid } from 'theme-ui'

interface AjnaFormViewProps {
  dropdown?: SidebarSectionHeaderDropdown
  txSuccessAction?: () => void
}

export function AjnaFormView({
  dropdown,
  children,
  txSuccessAction,
}: PropsWithChildren<AjnaFormViewProps>) {
  const ajnaSafetySwitchOn = useFeatureToggle('AjnaSafetySwitch')
  const { t } = useTranslation()
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)
  const { walletAddress } = useAccount()
  const {
    environment: { collateralToken, dpmProxy, flow, isOwner, product, quoteToken },
    steps: {
      currentStep,
      editingStep,
      isExternalStep,
      isStepWithTransaction,
      setIsFlowStateReady,
      setNextStep,
      setStep,
      steps,
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
  } = useAjnaGeneralContext()
  const {
    form: { dispatch, state },
    position: {
      isSimulationLoading,
      resolvedId,
      currentPosition: { position },
    },
    validation: { isFormValid, hasErrors, isFormFrozen },
  } = useAjnaProductContext(product)
  const { connect } = useConnection({ initialConnect: false })
  const ajnaSuppressValidationEnabled = useFeatureToggle('AjnaSuppressValidation')

  const txHandler = useAjnaTxHandler()

  const flowState = useFlowState({
    ...(dpmProxy && { existingProxy: dpmProxy }),
    ...getFlowStateConfig({ collateralToken, quoteToken, state, flow }),
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
  } = getAjnaSidebarButtonsStatus({
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
  const primaryButtonLabel = getPrimaryButtonLabelKey({
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
  const primaryButtonActions = getAjnaSidebarPrimaryButtonActions({
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
  })
  const textButtonAction = () => {
    setisTransitionWaitingForApproval(false)
    setStep(editingStep)
  }
  const status = getAjnaSidebarTransactionStatus({
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

  const title = getAjnaSidebarTitle({ currentStep, isFormFrozen, product, position })

  const sidebarSectionProps: SidebarSectionProps = {
    title,
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
  useEffect(() => {
    if (!walletAddress && steps.indexOf(currentStep) > steps.indexOf(editingStep))
      setStep(editingStep)
  }, [walletAddress])

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
