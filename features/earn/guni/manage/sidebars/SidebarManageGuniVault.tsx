import { getToken } from 'blockchain/tokensMetadata'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarVaultAllowanceStage } from 'components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'components/vault/sidebar/SidebarVaultProxyStage'
import { SidebarManageGuniVaultEditingState } from 'features/earn/guni/manage/sidebars/SidebarManageGuniVaultEditingState'
import { SidebarManageGuniVaultManageStage } from 'features/earn/guni/manage/sidebars/SidebarManageGuniVaultManageStage'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { getTextButtonLabel } from 'features/sidebar/getTextButtonLabel'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import {
  extractPrimaryButtonLabelParams,
  extractSidebarTxData,
} from 'helpers/extractSidebarHelpers'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'
import { Grid } from 'theme-ui'

export function SidebarManageGuniVault(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    accountIsConnected,
    canProgress,
    canRegress,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isEditingStage,
    isLoadingStage,
    isManageStage,
    isProxyStage,
    otherAction,
    progress,
    regress,
    stage,
    toggle,
    vault: { token },
  } = props
  const [forcePanel, setForcePanel] = useState<string>()
  const flow: SidebarFlow = 'manageGuni'
  const gasData = extractGasDataFromState(props)
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)
  const sidebarTxData = extractSidebarTxData(props)

  useEffect(() => {
    switch (stage) {
      case 'adjustPosition':
        setForcePanel('overview')
        break
      case 'otherActions':
        setForcePanel('close')
        break
    }
  }, [stage])

  // TODO: some of the settings in this vault are different from other vaults, because there are no features in guni besides closing it.
  // There should be VaultErrors and VaultWarnings inside, but currently it makes no sense because you can't change anything.
  // Primary button should be hidden in more generic way when there would be something to based it on
  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token }),
    dropdown: {
      forcePanel,
      disabled: isDropdownDisabled({ stage }),
      items: [
        {
          label: t('system.actions.earn.vault-overview'),
          icon: getToken(token).iconCircle,
          panel: 'overview',
          action: () => {
            toggle!('adjustPosition')
          },
        },
        {
          label: t('system.actions.common.close-vault'),
          icon: 'circle_close',
          iconShrink: 2,
          panel: 'close',
          action: () => {
            toggle!('otherActions')
          },
        },
      ],
    },
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarManageGuniVaultEditingState {...props} />}
        {isProxyStage && <SidebarVaultProxyStage stage={stage} gasData={gasData} />}
        {(isCollateralAllowanceStage || isDaiAllowanceStage) && (
          <SidebarVaultAllowanceStage {...props} />
        )}
        {isManageStage && <SidebarManageGuniVaultManageStage {...props} />}
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ flow, ...primaryButtonLabelParams }),
      hidden: stage === 'adjustPosition',
      disabled: !canProgress || !accountIsConnected,
      isLoading: isLoadingStage,
      action: () => {
        progress!()
      },
    },
    textButton: {
      label: getTextButtonLabel({ flow, stage, otherAction, token }),
      hidden: !canRegress,
      action: () => {
        regress!()
      },
    },
    status: getSidebarStatus({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
