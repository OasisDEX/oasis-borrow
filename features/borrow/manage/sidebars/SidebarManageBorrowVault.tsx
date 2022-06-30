import { trackingEvents } from 'analytics/analytics'
import { ALLOWED_MULTIPLY_TOKENS, getToken, ONLY_MULTIPLY_TOKENS } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarVaultAllowanceStage } from 'components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'components/vault/sidebar/SidebarVaultProxyStage'
import { SidebarVaultSLTriggered } from 'components/vault/sidebar/SidebarVaultSLTriggered'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { getTextButtonLabel } from 'features/sidebar/getTextButtonLabel'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { progressTrackingEvent, regressTrackingEvent } from 'features/sidebar/trackingEvents'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import {
  extractPrimaryButtonLabelParams,
  extractSidebarTxData,
} from 'helpers/extractSidebarHelpers'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

import { SidebarManageBorrowVaultEditingStage } from './SidebarManageBorrowVaultEditingStage'
import { SidebarManageBorrowVaultManageStage } from './SidebarManageBorrowVaultManageStage'
import { SidebarManageBorrowVaultTransitionStage } from './SidebarManageBorrowVaultTransitionStage'

export function SidebarManageBorrowVault(props: ManageStandardBorrowVaultState) {
  const { t } = useTranslation()
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')

  const {
    accountIsConnected,
    accountIsController,
    canProgress,
    canRegress,
    currentStep,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isEditingStage,
    isLoadingStage,
    isManageStage,
    isMultiplyTransitionStage,
    isProxyStage,
    isSuccessStage,
    progress,
    regress,
    stage,
    stopLossTriggered,
    toggle,
    totalSteps,
    vault: { token },
    vaultHistory,
  } = props

  const [forcePanel, setForcePanel] = useState<string>()
  const flow: SidebarFlow = 'manageBorrow'
  const canTransition =
    ALLOWED_MULTIPLY_TOKENS.includes(token) || ONLY_MULTIPLY_TOKENS.includes(token)
  const gasData = extractGasDataFromState(props)
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams({
    canTransition,
    ...props,
  })
  const sidebarTxData = extractSidebarTxData(props)
  const isVaultClosed =
    vaultHistory[0]?.kind === 'CLOSE_VAULT_TO_DAI' ||
    vaultHistory[0]?.kind === 'CLOSE_VAULT_TO_COLLATERAL'
  const [isSLPanelVisible, setIsSLPanelVisible] = useState<boolean>(
    stopLossTriggered && stopLossReadEnabled && isVaultClosed,
  )

  useEffect(() => {
    switch (stage) {
      case 'collateralEditing':
        setForcePanel('collateral')
        break
      case 'daiEditing':
        setForcePanel('dai')
        break
      case 'multiplyTransitionEditing':
        setForcePanel('transition')
        break
    }
  }, [stage])

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token, isSLPanelVisible }),
    dropdown: {
      forcePanel,
      disabled: isDropdownDisabled({ stage, isSLPanelVisible }),
      items: [
        {
          label: t('system.actions.borrow.edit-collateral', { token }),
          shortLabel: token,
          icon: getToken(token).iconCircle,
          panel: 'collateral',
          action: () => {
            toggle!('collateralEditing')
            trackingEvents.switchToCollateral(accountIsController)
          },
        },
        {
          label: t('system.actions.borrow.edit-dai'),
          shortLabel: 'DAI',
          icon: getToken('DAI').iconCircle,
          panel: 'dai',
          action: () => {
            toggle!('daiEditing')
            trackingEvents.switchToDai(accountIsController)
          },
        },
        {
          label: t('system.actions.borrow.switch-to-multiply'),
          icon: 'circle_exchange',
          iconShrink: 2,
          panel: 'transition',
          action: () => {
            toggle!('multiplyTransitionEditing')
          },
        },
      ],
    },
    content: (
      <Grid gap={3}>
        {!isSLPanelVisible ? (
          <>
            {isEditingStage && <SidebarManageBorrowVaultEditingStage {...props} />}
            {isProxyStage && <SidebarVaultProxyStage stage={stage} gasData={gasData} />}
            {(isCollateralAllowanceStage || isDaiAllowanceStage) && (
              <SidebarVaultAllowanceStage {...props} />
            )}
            {isMultiplyTransitionStage && (
              <SidebarManageBorrowVaultTransitionStage stage={stage} token={token} />
            )}
            {isManageStage && <SidebarManageBorrowVaultManageStage {...props} />}
          </>
        ) : (
          <SidebarVaultSLTriggered closeEvent={vaultHistory[0]} />
        )}
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ flow, isSLPanelVisible, ...primaryButtonLabelParams }),
      disabled: (!canProgress || !accountIsConnected) && !isSLPanelVisible,
      steps: !isSuccessStage && !isSLPanelVisible ? [currentStep, totalSteps] : undefined,
      isLoading: isLoadingStage,
      action: () => {
        if (!isSLPanelVisible) {
          progress!()
          progressTrackingEvent({ props })
        } else setIsSLPanelVisible(false)
      },
    },
    textButton: {
      label: getTextButtonLabel({ flow, stage, token }),
      hidden: !canRegress || isMultiplyTransitionStage,
      action: () => {
        regress!()
        regressTrackingEvent({ props })
      },
    },
    status: getSidebarStatus({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
