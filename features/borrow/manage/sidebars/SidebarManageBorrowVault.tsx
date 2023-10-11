import { trackingEvents } from 'analytics/trackingEvents'
import { getToken } from 'blockchain/tokensMetadata'
import { ALLOWED_MULTIPLY_TOKENS, ONLY_MULTIPLY_TOKENS } from 'blockchain/tokensMetadata.constants'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { SidebarAutomationVaultCloseTriggered } from 'components/vault/sidebar/SidebarAutomationVaultCloseTriggered'
import { SidebarVaultAllowanceStage } from 'components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'components/vault/sidebar/SidebarVaultProxyStage'
import { getAutomationThatClosedVault } from 'features/automation/common/helpers/getAutomationThatClosedVault'
import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { getTextButtonLabel } from 'features/sidebar/getTextButtonLabel'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { progressTrackingEvent, regressTrackingEvent } from 'features/sidebar/trackingEvents'
import type { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { mapAutomationEvents } from 'features/vaultHistory/vaultHistory'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import {
  extractPrimaryButtonLabelParams,
  extractSidebarTxData,
} from 'helpers/extractSidebarHelpers'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'
import { circle_exchange } from 'theme/icons'

import { SidebarManageBorrowVaultEditingStage } from './SidebarManageBorrowVaultEditingStage'
import { SidebarManageBorrowVaultManageStage } from './SidebarManageBorrowVaultManageStage'
import { SidebarManageBorrowVaultTransitionStage } from './SidebarManageBorrowVaultTransitionStage'

export function SidebarManageBorrowVault(props: ManageStandardBorrowVaultState) {
  const { t } = useTranslation()

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
    autoTakeProfitTriggered,
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
  const [isClosedVaultPanelVisible, setIsClosedVaultPanelVisible] = useState<boolean>(
    (stopLossTriggered || autoTakeProfitTriggered) && isVaultClosed,
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
    title: getSidebarTitle({
      flow,
      stage,
      token,
      isClosedVaultPanelVisible,
      automationThatClosedVault: getAutomationThatClosedVault({
        stopLossTriggered,
        autoTakeProfitTriggered,
      }),
    }),
    dropdown: {
      forcePanel,
      disabled: isDropdownDisabled({ stage, isClosedVaultPanelVisible }),
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
          icon: circle_exchange,
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
        {!isClosedVaultPanelVisible ? (
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
          <SidebarAutomationVaultCloseTriggered closeEvent={mapAutomationEvents(vaultHistory)[0]} />
        )}
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({
        flow,
        isClosedVaultPanelVisible,
        ...primaryButtonLabelParams,
      }),
      disabled: (!canProgress || !accountIsConnected) && !isClosedVaultPanelVisible,
      steps: !isSuccessStage && !isClosedVaultPanelVisible ? [currentStep, totalSteps] : undefined,
      isLoading: isLoadingStage,
      action: () => {
        if (!isClosedVaultPanelVisible) {
          progress!()
          progressTrackingEvent({ props })
        } else setIsClosedVaultPanelVisible(false)
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
