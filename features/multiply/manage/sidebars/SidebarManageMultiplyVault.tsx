import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarVaultAllowanceStage } from 'components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'components/vault/sidebar/SidebarVaultProxyStage'
import { SidebarVaultSLTriggered } from 'components/vault/sidebar/SidebarVaultSLTriggered'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { SidebarManageMultiplyVaultManageStage } from 'features/multiply/manage/sidebars/SidebarManageMultiplyVaultManageStage'
import { SidebarManageMultiplyVaultTransitionStage } from 'features/multiply/manage/sidebars/SidebarManageMultiplyVaultTransitionStage'
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

import { SidebarManageMultiplyVaultEditingStage } from './SidebarManageMultiplyVaultEditingStage'

export const otherActionsCollateralPanel = ['depositCollateral', 'withdrawCollateral']
export const otherActionsDaiPanel = ['depositDai', 'paybackDai', 'withdrawDai']

export function SidebarManageMultiplyVault(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()
  const stopLossReadEnabled = useFeatureToggle('StopLossRead')

  const {
    accountIsConnected,
    canProgress,
    canRegress,
    currentStep,
    isBorrowTransitionStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isEditingStage,
    isLoadingStage,
    isManageStage,
    isProxyStage,
    isSuccessStage,
    otherAction,
    progress,
    regress,
    setOtherAction,
    stage,
    stopLossTriggered,
    toggle,
    totalSteps,
    vault: { token },
    vaultHistory,
  } = props

  const [forcePanel, setForcePanel] = useState<string>()
  const flow: SidebarFlow = 'manageMultiply'
  const gasData = extractGasDataFromState(props)
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)
  const sidebarTxData = extractSidebarTxData(props)
  const isVaultClosed =
    vaultHistory[0]?.kind === 'CLOSE_VAULT_TO_DAI' ||
    vaultHistory[0]?.kind === 'CLOSE_VAULT_TO_COLLATERAL'
  const [isSLPanelVisible, setIsSLPanelVisible] = useState<boolean>(
    stopLossTriggered && stopLossReadEnabled && isVaultClosed,
  )

  useEffect(() => {
    switch (stage) {
      case 'adjustPosition':
        setForcePanel('adjust')
        break
      case 'otherActions':
        if (otherActionsCollateralPanel.includes(otherAction)) setForcePanel('collateral')
        else if (otherActionsDaiPanel.includes(otherAction)) setForcePanel('dai')
        else if (otherAction === 'closeVault') setForcePanel('close')
        break
      case 'borrowTransitionEditing':
        setForcePanel('transition')
        break
    }
  }, [stage, otherAction])

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token, isSLPanelVisible }),
    dropdown: {
      forcePanel,
      disabled: isDropdownDisabled({ stage, isSLPanelVisible }),
      items: [
        {
          label: t('system.actions.multiply.adjust'),
          icon: 'circle_slider',
          iconShrink: 2,
          panel: 'adjust',
          action: () => {
            toggle!('adjustPosition')
          },
        },
        {
          label: t('system.actions.borrow.edit-collateral', { token }),
          shortLabel: token,
          icon: getToken(token).iconCircle,
          panel: 'collateral',
          action: () => {
            toggle!('otherActions')
            setOtherAction!('depositCollateral')
          },
        },
        {
          label: t('system.actions.borrow.edit-dai'),
          shortLabel: 'DAI',
          icon: getToken('DAI').iconCircle,
          panel: 'dai',
          action: () => {
            toggle!('otherActions')
            setOtherAction!('depositDai')
          },
        },
        {
          label: t('system.actions.multiply.switch-to-borrow'),
          icon: 'circle_exchange',
          iconShrink: 2,
          panel: 'transition',
          action: () => {
            toggle!('borrowTransitionEditing')
            setOtherAction!('depositCollateral')
          },
        },
        {
          label: t('system.actions.common.close-vault'),
          icon: 'circle_close',
          iconShrink: 2,
          panel: 'close',
          action: () => {
            toggle!('otherActions')
            setOtherAction!('closeVault')
          },
        },
      ],
    },
    content: (
      <Grid gap={3}>
        {!isSLPanelVisible ? (
          <>
            {isEditingStage && <SidebarManageMultiplyVaultEditingStage {...props} />}
            {isProxyStage && <SidebarVaultProxyStage stage={stage} gasData={gasData} />}
            {(isCollateralAllowanceStage || isDaiAllowanceStage) && (
              <SidebarVaultAllowanceStage {...props} />
            )}
            {isBorrowTransitionStage && <SidebarManageMultiplyVaultTransitionStage stage={stage} />}
            {isManageStage && <SidebarManageMultiplyVaultManageStage {...props} />}
          </>
        ) : (
          <SidebarVaultSLTriggered closeEvent={vaultHistory[0]} />
        )}
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ flow, isSLPanelVisible, ...primaryButtonLabelParams }),
      disabled: (!canProgress || !accountIsConnected) && !isSLPanelVisible,
      steps: !isSuccessStage && isSLPanelVisible ? [currentStep, totalSteps] : undefined,
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
      hidden: !canRegress || isBorrowTransitionStage,
      action: () => {
        regress!()
        regressTrackingEvent({ props })
      },
    },
    status: getSidebarStatus({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
