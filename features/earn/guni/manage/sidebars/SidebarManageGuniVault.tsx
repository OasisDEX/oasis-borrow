import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarVaultAllowanceStage } from 'components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'components/vault/sidebar/SidebarVaultProxyStage'
import { SidebarManageGuniVaultEditingState } from 'features/earn/guni/manage/sidebars/SidebarManageGuniVaultEditingState'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { getTextButtonLabel } from 'features/sidebar/getTextButtonLabel'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import {
  extractPrimaryButtonLabelParams,
  extractSidebarTxData,
} from 'helpers/extractSidebarHelpers'
import React, { useEffect } from 'react'
import { Grid } from 'theme-ui'

export function SidebarManageGuniVault(props: ManageMultiplyVaultState) {
  const {
    canProgress,
    stage,
    isEditingStage,
    accountIsConnected,
    canRegress,
    regress,
    isLoadingStage,
    progress,
    setCloseVaultTo,
    isProxyStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    vault: { token },
  } = props

  useEffect(() => {
    if (stage === 'adjustPosition') setCloseVaultTo!('dai')
  }, [stage])

  const flow: SidebarFlow = 'manageGuni'
  const gasData = extractGasDataFromState(props)
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)
  const sidebarTxData = extractSidebarTxData(props)

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token }),
    content: (
      <Grid gap={3}>
        {stage}
        {isEditingStage && <SidebarManageGuniVaultEditingState {...props} />}

        {isProxyStage && <SidebarVaultProxyStage stage={stage} gasData={gasData} />}
        {(isCollateralAllowanceStage || isDaiAllowanceStage) && (
          <SidebarVaultAllowanceStage {...props} />
        )}
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ flow, ...primaryButtonLabelParams }),
      disabled: !canProgress || !accountIsConnected,
      isLoading: isLoadingStage,
      action: () => {
        progress!()
      },
    },
    textButton: {
      label: getTextButtonLabel({ flow, stage, token }),
      hidden: !canRegress,
      action: () => {
        regress!()
      },
    },
    status: getSidebarStatus({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
