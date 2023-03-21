import { useAppContext } from 'components/AppContextProvider'
import { FlowSidebar } from 'components/FlowSidebar'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { ethers } from 'ethers'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { getAjnaSidebarButtonsStatus } from 'features/ajna/positions/common/helpers/getAjnaSidebarButtonsStatus'
import { getAjnaSidebarPrimaryButtonActions } from 'features/ajna/positions/common/helpers/getAjnaSidebarPrimaryButtonActions'
import { getAjnaSidebarTransactionStatus } from 'features/ajna/positions/common/helpers/getAjnaSidebarTransactionStatus'
import { getFlowStateConfig } from 'features/ajna/positions/common/helpers/getFlowStateConfig'
import { getPrimaryButtonLabelKey } from 'features/ajna/positions/common/helpers/getPrimaryButtonLabelKey'
import { useAjnaTxHandler } from 'features/ajna/positions/common/hooks/useAjnaTxHandler'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { useFlowState } from 'helpers/useFlowState'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { PropsWithChildren, useEffect } from 'react'
import { Grid } from 'theme-ui'

interface AjnaFormViewProps {
  dropdown?: SidebarSectionHeaderDropdown
}

export function AjnaFormView({ dropdown, children }: PropsWithChildren<AjnaFormViewProps>) {
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
    position: { isSimulationLoading, resolvedId },
    validation: { isFormValid, hasErrors },
  } = useAjnaProductContext(product)

  const txHandler = useAjnaTxHandler()

  const flowState = useFlowState({
    ...(dpmProxy && { existingProxy: dpmProxy }),
    ...getFlowStateConfig({ collateralToken, quoteToken, state, flow }),
    onEverythingReady: () => setNextStep(),
    onGoBack: () => setStep(editingStep),
  })

  const {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  } = getAjnaSidebarButtonsStatus({
    currentStep,
    editingStep,
    isAllowanceLoading: flowState.isLoading,
    isFormValid,
    hasErrors,
    isOwner,
    isSimulationLoading,
    isTxError,
    isTxInProgress,
    isTxStarted,
    isTxWaitingForApproval,
    walletAddress,
  })
  const primaryButtonLabel = getPrimaryButtonLabelKey({
    flow,
    currentStep,
    product,
    hasDpmAddress: flowState.isProxyReady,
    walletAddress,
    isTxSuccess,
    isTxError,
  })
  const primaryButtonActions = getAjnaSidebarPrimaryButtonActions({
    defaultAction: async () => {
      if (isStepWithTransaction) {
        if (isTxSuccess) {
          setTxDetails(undefined)
          setStep(editingStep)
        } else txHandler()
      } else setNextStep()
    },
    currentStep,
    editingStep,
    flow,
    resolvedId,
    isTxSuccess,
    walletAddress,
  })
  const status = getAjnaSidebarTransactionStatus({
    etherscan: context?.etherscan.url,
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
    title: t(`ajna.position-page.common.form.title.${currentStep}`, {
      product: upperFirst(product),
    }),
    dropdown,
    content: <Grid gap={3}>{children}</Grid>,
    primaryButton: {
      label: t(primaryButtonLabel),
      disabled: isPrimaryButtonDisabled,
      isLoading: isPrimaryButtonLoading,
      hidden: isPrimaryButtonHidden,
      ...primaryButtonActions,
    },
    textButton: {
      label: t('back-to-editing'),
      action: () => setStep(editingStep),
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
