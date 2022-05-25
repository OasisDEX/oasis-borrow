import { ALLOWED_MULTIPLY_TOKENS, getToken, ONLY_MULTIPLY_TOKENS } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { progressTrackingEvent } from 'features/sidebar/trackingEventOpenVault'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

import { SidebarManageBorrowVaultEditingStage } from './SidebarManageBorrowVaultEditingStage'
import { SidebarManageBorrowVaultManageStage } from './SidebarManageBorrowVaultManageStage'
import { SidebarManageBorrowVaultTransitionStage } from './SidebarManageBorrowVaultTransitionStage'
import { SidebarManageVaultAllowanceStage } from './SidebarManageVaultAllowanceStage'
import { SidebarOpenVaultProxyStage } from './SidebarOpenVaultProxyStage'

export function SidebarManageBorrowVault(props: ManageStandardBorrowVaultState) {
  const { t } = useTranslation()

  const {
    vault: { id, token },
    canProgress,
    progress,
    toggle,
    stage,
    isEditingStage,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isManageStage,
    isMultiplyTransitionStage,
    isLoadingStage,
    isSuccessStage,
    currentStep,
    totalSteps,
    accountIsConnected,
    proxyAddress,
    insufficientCollateralAllowance,
    insufficientDaiAllowance,
  } = props
  const [forcePanel, setForcePanel] = useState<string>()
  const gasData = extractGasDataFromState(props)
  const canTransition =
    ALLOWED_MULTIPLY_TOKENS.includes(token) || ONLY_MULTIPLY_TOKENS.includes(token)

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
    title: getSidebarTitle({ flow: 'manageBorrow', stage, token }),
    forcePanel,
    dropdown: [
      {
        label: t('system.actions.borrow.edit-collateral', { token }),
        shortLabel: token,
        icon: getToken(token).iconCircle,
        panel: 'collateral',
        action: () => {
          toggle!('collateralEditing')
        },
      },
      {
        label: t('system.actions.borrow.edit-dai'),
        shortLabel: 'DAI',
        icon: getToken('DAI').iconCircle,
        panel: 'dai',
        action: () => {
          toggle!('daiEditing')
        },
      },
      {
        label: t('system.actions.borrow.switch-to-multiply'),
        panel: 'transition',
        action: () => {
          toggle!('multiplyTransitionEditing')
        },
      },
    ],
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarManageBorrowVaultEditingStage {...props} />}
        {isProxyStage && <SidebarOpenVaultProxyStage stage={stage} gasData={gasData} />}
        {(isCollateralAllowanceStage || isDaiAllowanceStage) && (
          <SidebarManageVaultAllowanceStage {...props} />
        )}
        {isMultiplyTransitionStage && (
          <SidebarManageBorrowVaultTransitionStage stage={stage} token={token} />
        )}
        {isManageStage && <SidebarManageBorrowVaultManageStage {...props} />}
        <VaultErrors {...props} />
        <VaultWarnings {...props} />
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({
        flow: 'manageBorrow',
        stage,
        id,
        token,
        proxyAddress,
        insufficientCollateralAllowance,
        insufficientDaiAllowance,
        canTransition,
      }),
      disabled: !canProgress || !accountIsConnected,
      steps: !isSuccessStage ? [currentStep, totalSteps] : undefined,
      isLoading: isLoadingStage,
      action: () => {
        progress!()
        progressTrackingEvent({ props })
      },
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
