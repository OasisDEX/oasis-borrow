import { getToken } from 'blockchain/tokensMetadata'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { SidebarAutomationVaultCloseTriggered } from 'components/vault/sidebar/SidebarAutomationVaultCloseTriggered'
import { SidebarVaultAllowanceStage } from 'components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'components/vault/sidebar/SidebarVaultProxyStage'
import { getAutomationThatClosedVault } from 'features/automation/common/helpers/getAutomationThatClosedVault'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'
import { SidebarManageMultiplyVaultManageStage } from 'features/multiply/manage/sidebars/SidebarManageMultiplyVaultManageStage'
import { SidebarManageMultiplyVaultTransitionStage } from 'features/multiply/manage/sidebars/SidebarManageMultiplyVaultTransitionStage'
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
import { circle_close, circle_exchange, circle_slider } from 'theme/icons'

import { SidebarManageMultiplyVaultEditingStage } from './SidebarManageMultiplyVaultEditingStage'

export const otherActionsCollateralPanel = ['depositCollateral', 'withdrawCollateral']
export const otherActionsDaiPanel = ['depositDai', 'paybackDai', 'withdrawDai']

export function SidebarManageMultiplyVault(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

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
    autoTakeProfitTriggered,
    toggle,
    totalSteps,
    vault: { token },
    vaultHistory,
    vaultType,
  } = props

  const [forcePanel, setForcePanel] = useState<string>()
  const flow: SidebarFlow = 'manageMultiply'
  const gasData = extractGasDataFromState(props)
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)
  const sidebarTxData = extractSidebarTxData(props)
  const isVaultClosed =
    vaultHistory[0]?.kind === 'CLOSE_VAULT_TO_DAI' ||
    vaultHistory[0]?.kind === 'CLOSE_VAULT_TO_COLLATERAL'
  const [isClosedVaultPanelVisible, setIsClosedVaultPanelVisible] = useState<boolean>(
    (stopLossTriggered || autoTakeProfitTriggered) && isVaultClosed,
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
        ...(vaultType === VaultType.Multiply
          ? [
              {
                label: t('system.actions.multiply.adjust'),
                icon: circle_slider,
                iconShrink: 2,
                panel: 'adjust',
                action: () => {
                  toggle!('adjustPosition')
                },
              },
            ]
          : []),
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
            if (vaultType === VaultType.Borrow) {
              setOtherAction!('paybackDai')
            } else {
              setOtherAction!('depositDai')
            }
          },
        },
        {
          label:
            vaultType === VaultType.Borrow
              ? t('system.actions.borrow.switch-to-multiply')
              : t('system.actions.multiply.switch-to-borrow'),
          icon: circle_exchange,
          iconShrink: 2,
          panel: 'transition',
          action: () => {
            toggle!('borrowTransitionEditing')
            setOtherAction!('depositCollateral')
          },
        },
        ...(vaultType === VaultType.Borrow
          ? [
              {
                label: t('system.actions.multiply.adjust'),
                icon: circle_slider,
                iconShrink: 2,
                panel: 'adjust',
                action: () => {
                  toggle!('adjustPosition')
                },
              },
            ]
          : []),
        {
          label: t('system.actions.common.close-vault'),
          icon: circle_close,
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
        {!isClosedVaultPanelVisible ? (
          <>
            {isEditingStage && <SidebarManageMultiplyVaultEditingStage {...props} />}
            {isProxyStage && <SidebarVaultProxyStage stage={stage} gasData={gasData} />}
            {(isCollateralAllowanceStage || isDaiAllowanceStage) && (
              <SidebarVaultAllowanceStage {...props} />
            )}
            {isBorrowTransitionStage && (
              <SidebarManageMultiplyVaultTransitionStage
                stage={stage}
                vaultType={vaultType}
                token={token}
              />
            )}
            {isManageStage && <SidebarManageMultiplyVaultManageStage {...props} />}
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
        vaultType,
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
