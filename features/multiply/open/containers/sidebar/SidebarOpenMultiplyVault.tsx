import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarOpenVaultAllowanceStage } from 'components/vault/sidebar/SidebarOpenVaultAllowanceStage'
import { SidebarOpenVaultProxyStage } from 'components/vault/sidebar/SidebarOpenVaultProxyStage'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { getHeaderButton } from 'features/sidebar/getHeaderButton'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarProgress } from 'features/sidebar/getSidebarProgress'
import { getSidebarSuccess } from 'features/sidebar/getSidebarSuccess'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import {
  progressTrackingEvent,
  regressTrackingEvent,
} from 'features/sidebar/trackingEventOpenVault'
import { extractGasDataFromState } from 'helpers/extractGasDataFromState'
import {
  extractAllowanceDataFromOpenVaultState,
  extractSidebarButtonLabelParams,
  extractSidebarTxData,
} from 'helpers/extractSidebarHelpers'
import { isFirstCdp } from 'helpers/isFirstCdp'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { OpenMultiplyVaultState } from '../../pipes/openMultiplyVault'
import { SidebarOpenMultiplyVaultEditingState } from './SidebarOpenMultiplyVaultEditingState'
import { SidebarOpenMultiplyVaultOpenStage } from './SidebarOpenMultiplyVaultOpenStage'

export function SidebarOpenMultiplyVault(props: OpenMultiplyVaultState) {
  const { t } = useTranslation()
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
    updateDeposit,
    inputAmountsEmpty,
  } = props

  const gasData = extractGasDataFromState(props)
  const firstCDP = isFirstCdp(accountData)
  const allowanceData = extractAllowanceDataFromOpenVaultState(props)
  const sidebarPrimaryButtonLabelParams = extractSidebarButtonLabelParams({
    flow: 'openMultiply',
    ...props,
  })
  const sidebarTxData = extractSidebarTxData(props)

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow: 'openMultiply', stage, token }),
    headerButton: getHeaderButton({
      stage,
      canResetForm: isEditingStage && !inputAmountsEmpty,
      resetForm: () => {
        updateDeposit!(undefined)
      },
      canRegress,
      regress,
      regressCallback: () => {
        regressTrackingEvent({ props, firstCDP })
      },
    }),
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
      label: getPrimaryButtonLabel(sidebarPrimaryButtonLabelParams),
      steps: !isSuccessStage ? [currentStep, totalSteps] : undefined,
      disabled: !canProgress,
      isLoading: isLoadingStage,
      action: () => {
        if (!isSuccessStage) progress!()
        progressTrackingEvent({ props, firstCDP })
      },
      url: isSuccessStage ? `/${id}` : undefined,
    },
    ...(isEditingStage && {
      textButton: {
        label: t('system.actions.multiply.switch-to-borrow'),
        url: `/vaults/open/${ilk}`,
      },
    }),
    progress: getSidebarProgress(sidebarTxData),
    success: getSidebarSuccess(sidebarTxData),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
