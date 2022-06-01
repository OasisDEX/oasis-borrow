import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarProgress } from 'features/sidebar/getSidebarProgress'
import { getSidebarSuccess } from 'features/sidebar/getSidebarSuccess'
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
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

import { SidebarManageMultiplyVaultEditingStage } from './SidebarManageMultiplyVaultEditingStage'
import { SidebarManageMultiplyVaultManageStage } from './SidebarManageMultiplyVaultManageStage'
import { SidebarManageMultiplyVaultTransitionStage } from './SidebarManageMultiplyVaultTransitionStage'
import { SidebarManageVaultAllowanceStage } from './SidebarManageVaultAllowanceStage'
import { SidebarOpenVaultProxyStage } from './SidebarOpenVaultProxyStage'

export const otherActionsCollateralPanel = ['depositCollateral', 'withdrawCollateral']
export const otherActionsDaiPanel = ['depositDai', 'paybackDai', 'withdrawDai']

export function SidebarManageMultiplyVault(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    stage,
    otherAction,
    toggle,
    setOtherAction,
    canProgress,
    progress,
    canRegress,
    regress,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isEditingStage,
    isManageStage,
    isLoadingStage,
    isSuccessStage,
    isBorrowTransitionStage,
    accountIsConnected,
    currentStep,
    totalSteps,
    vault: { token },
  } = props

  const [forcePanel, setForcePanel] = useState<string>()
  const flow: SidebarFlow = 'manageMultiply'
  const gasData = extractGasDataFromState(props)
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)
  const sidebarTxData = extractSidebarTxData(props)

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
    title: getSidebarTitle({ flow, stage, token }),
    dropdown: {
      forcePanel,
      disabled: isDropdownDisabled({ stage }),
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
        {isEditingStage && <SidebarManageMultiplyVaultEditingStage {...props} />}
        {isProxyStage && <SidebarOpenVaultProxyStage stage={stage} gasData={gasData} />}
        {(isCollateralAllowanceStage || isDaiAllowanceStage) && (
          <SidebarManageVaultAllowanceStage {...props} />
        )}
        {isBorrowTransitionStage && <SidebarManageMultiplyVaultTransitionStage stage={stage} />}
        {isManageStage && <SidebarManageMultiplyVaultManageStage {...props} />}
        <VaultErrors {...props} />
        <VaultWarnings {...props} />
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ flow, ...primaryButtonLabelParams }),
      disabled: !canProgress || !accountIsConnected,
      steps: !isSuccessStage ? [currentStep, totalSteps] : undefined,
      isLoading: isLoadingStage,
      action: () => {
        progress!()
        progressTrackingEvent({ props })
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
    progress: getSidebarProgress({ flow, ...sidebarTxData }),
    success: getSidebarSuccess({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
