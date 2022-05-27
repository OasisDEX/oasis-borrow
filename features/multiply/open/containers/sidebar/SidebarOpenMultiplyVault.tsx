import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarOpenVaultAllowanceStage } from 'components/vault/sidebar/SidebarOpenVaultAllowanceStage'
import { SidebarOpenVaultProxyStage } from 'components/vault/sidebar/SidebarOpenVaultProxyStage'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarProgress } from 'features/sidebar/getSidebarProgress'
import { getSidebarSuccess } from 'features/sidebar/getSidebarSuccess'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { getTextButtonLabel } from 'features/sidebar/getTextButtonLabel'
import { progressTrackingEvent, regressTrackingEvent } from 'features/sidebar/trackingEvents'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import {
  extractPrimaryButtonLabelParams,
  extractSidebarAllowanceData,
  extractSidebarTxData,
} from 'helpers/extractSidebarHelpers'
import { isFirstCdp } from 'helpers/isFirstCdp'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { Grid } from 'theme-ui'

import { OpenMultiplyVaultState } from '../../pipes/openMultiplyVault'
import { SidebarOpenMultiplyVaultEditingState } from './SidebarOpenMultiplyVaultEditingState'
import { SidebarOpenMultiplyVaultOpenStage } from './SidebarOpenMultiplyVaultOpenStage'

export function SidebarOpenMultiplyVault(props: OpenMultiplyVaultState) {
  const { accountData$ } = useAppContext()
  const [accountData] = useObservable(accountData$)

  const {
    id,
    stage,
    canProgress,
    progress,
    canRegress,
    regress,
    isEditingStage,
    isProxyStage,
    isAllowanceStage,
    isOpenStage,
    isLoadingStage,
    isSuccessStage,
    token,
    totalSteps,
    currentStep,
    ilk,
  } = props

  const flow: SidebarFlow = 'openMultiply'
  const firstCDP = isFirstCdp(accountData)
  const gasData = extractGasDataFromState(props)
  const allowanceData = extractSidebarAllowanceData(props)
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)
  const sidebarTxData = extractSidebarTxData(props)

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token }),
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarOpenMultiplyVaultEditingState {...props} />}
        {isProxyStage && <SidebarOpenVaultProxyStage stage={stage} gasData={gasData} />}
        {isAllowanceStage && <SidebarOpenVaultAllowanceStage {...allowanceData} />}
        {isOpenStage && <SidebarOpenMultiplyVaultOpenStage {...props} />}
        <VaultErrors {...props} />
        <VaultWarnings {...props} />
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ ...primaryButtonLabelParams, flow }),
      steps: !isSuccessStage ? [currentStep, totalSteps] : undefined,
      disabled: !canProgress,
      isLoading: isLoadingStage,
      action: () => {
        if (!isSuccessStage) progress!()
        progressTrackingEvent({ props, firstCDP })
      },
      url: isSuccessStage ? `/${id}` : undefined,
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
    progress: getSidebarProgress({ ...sidebarTxData, flow }),
    success: getSidebarSuccess({ ...sidebarTxData, flow }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
