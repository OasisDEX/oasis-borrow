import { AutomationContextProvider, useAccountContext } from 'components/context'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { SidebarVaultAllowanceStage } from 'components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'components/vault/sidebar/SidebarVaultProxyStage'
import { SidebarVaultStopLossStage } from 'components/vault/sidebar/SidebarVaultStopLossStage'
import { openVaultWithStopLossAnalytics } from 'features/automation/common/helpers/openVaultWithStopLossAnalytics'
import { getDataForStopLoss } from 'features/automation/protection/stopLoss/openFlow/openVaultStopLoss'
import { SidebarAdjustStopLossEditingStage } from 'features/automation/protection/stopLoss/sidebars/SidebarAdjustStopLossEditingStage'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import type { OpenMultiplyVaultState } from 'features/multiply/open/pipes/openMultiplyVault.types'
import { SidebarOpenMultiplyVaultEditingState } from 'features/multiply/open/sidebars/SidebarOpenMultiplyVaultEditingState'
import { SidebarOpenMultiplyVaultOpenStage } from 'features/multiply/open/sidebars/SidebarOpenMultiplyVaultOpenStage'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { getTextButtonLabel } from 'features/sidebar/getTextButtonLabel'
import { progressTrackingEvent, regressTrackingEvent } from 'features/sidebar/trackingEvents'
import type { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { useAppConfig } from 'helpers/config'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import {
  extractPrimaryButtonLabelParams,
  extractSidebarTxData,
} from 'helpers/extractSidebarHelpers'
import { isFirstCdp } from 'helpers/isFirstCdp'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function SidebarOpenMultiplyVault(props: OpenMultiplyVaultState) {
  const { t } = useTranslation()
  const { accountData$ } = useAccountContext()
  const [accountData] = useObservable(accountData$)

  const {
    canProgress,
    canRegress,
    currentStep,
    id,
    ilk,
    isAllowanceStage,
    isEditingStage,
    isLoadingStage,
    isOpenStage,
    isProxyStage,
    isStopLossEditingStage,
    isSuccessStage,
    progress,
    regress,
    stage,
    token,
    totalSteps,
    isStopLossSuccessStage,
    openFlowWithStopLoss,
    isAddStopLossStage,
    skipStopLoss,
    stopLossLevel,
    stopLossCloseType,
    afterCollateralizationRatio,
  } = props

  const flow: SidebarFlow = !isStopLossEditingStage ? 'openMultiply' : 'addSl'
  const firstCDP = isFirstCdp(accountData)
  const gasData = extractGasDataFromState(props)

  const primaryButtonLabelParams = extractPrimaryButtonLabelParams({ ...props })
  const sidebarTxData = extractSidebarTxData(props)
  const { stopLossSidebarProps, automationContextProps } = getDataForStopLoss(props, 'multiply')
  const { ProxyCreationDisabled: isProxyCreationDisabled } = useAppConfig('features')

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token, openFlowWithStopLoss }),
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarOpenMultiplyVaultEditingState {...props} />}
        {isStopLossEditingStage && (
          <AutomationContextProvider {...automationContextProps}>
            <SidebarAdjustStopLossEditingStage {...stopLossSidebarProps} />{' '}
          </AutomationContextProvider>
        )}
        {isProxyStage && <SidebarVaultProxyStage stage={stage} gasData={gasData} />}
        {isAllowanceStage && <SidebarVaultAllowanceStage {...props} />}
        {isOpenStage && <SidebarOpenMultiplyVaultOpenStage {...props} />}
        {isAddStopLossStage && <SidebarVaultStopLossStage {...props} />}
      </Grid>
    ),
    ...(isStopLossEditingStage && {
      headerButton: {
        label: t('protection.continue-without-stop-loss'),
        action: () => skipStopLoss!(),
      },
    }),
    primaryButton: {
      label: getPrimaryButtonLabel({
        ...primaryButtonLabelParams,
        flow,
        vaultType: VaultType.Multiply,
      }),
      steps: !isSuccessStage && !isAddStopLossStage ? [currentStep, totalSteps] : undefined,
      disabled: !canProgress || (isProxyStage && isProxyCreationDisabled),
      isLoading: isLoadingStage,
      action: () => {
        if (!isSuccessStage && !isStopLossSuccessStage) progress!()
        progressTrackingEvent({ props, firstCDP })
        if (isAddStopLossStage) {
          openVaultWithStopLossAnalytics({
            id,
            ilk,
            stopLossLevel,
            stopLossCloseType,
            afterCollateralizationRatio,
          })
        }
      },
      url:
        (isSuccessStage && !openFlowWithStopLoss) || isStopLossSuccessStage
          ? `/ethereum/maker/${id}`
          : undefined,
    },
    textButton: {
      label: getTextButtonLabel({ flow, stage, token }),
      hidden: (!canRegress || isSuccessStage) && !isEditingStage,
      action: () => {
        if (canRegress) regress!()
        regressTrackingEvent({ props })
      },
      url: !canRegress && isEditingStage ? `/vaults/open/${ilk}` : undefined,
    },
    status: getSidebarStatus({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
