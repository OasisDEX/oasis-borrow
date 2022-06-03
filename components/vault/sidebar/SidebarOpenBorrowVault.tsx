import { ALLOWED_MULTIPLY_TOKENS } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
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
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { SidebarOpenBorrowVaultEditingStage } from './SidebarOpenBorrowVaultEditingStage'
import { SidebarOpenBorrowVaultOpenStage } from './SidebarOpenBorrowVaultOpenStage'
import { SidebarOpenVaultAllowanceStage } from './SidebarOpenVaultAllowanceStage'
import { SidebarOpenVaultProxyStage } from './SidebarOpenVaultProxyStage'

export function SidebarOpenBorrowVault(props: OpenVaultState) {
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
    isStopLossEditingStage,
    isProxyStage,
    isAllowanceStage,
    isOpenStage,
    isLoadingStage,
    isSuccessStage,
    token,
    totalSteps,
    currentStep,
    ilk,
    skipStopLoss,
  } = props

  const flow: SidebarFlow = !isStopLossEditingStage ? 'openBorrow' : 'addSl'
  const firstCDP = isFirstCdp(accountData)
  const canTransition = ALLOWED_MULTIPLY_TOKENS.includes(token)
  const gasData = extractGasDataFromState(props)
  const allowanceData = extractSidebarAllowanceData(props)
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)
  const sidebarTxData = extractSidebarTxData(props)

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token }),
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarOpenBorrowVaultEditingStage {...props} />}
        {isStopLossEditingStage && <>STOP LOSS BRO</>}
        {isProxyStage && <SidebarOpenVaultProxyStage stage={stage} gasData={gasData} />}
        {isAllowanceStage && <SidebarOpenVaultAllowanceStage {...allowanceData} />}
        {isOpenStage && <SidebarOpenBorrowVaultOpenStage {...props} />}
        <VaultErrors {...props} />
        <VaultWarnings {...props} />
      </Grid>
    ),
    ...(isStopLossEditingStage && {
      headerButton: {
        label: t('protection.continue-without-stop-loss'),
        action: () => skipStopLoss!(),
      },
    }),
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
      hidden:
        (!canRegress || isSuccessStage) &&
        (!isEditingStage || !canTransition || !isStopLossEditingStage),
      action: () => {
        if (canRegress) regress!()
        regressTrackingEvent({ props })
      },
      url: !canRegress && isEditingStage ? `/vaults/open-multiply/${ilk}` : undefined,
    },
    progress: getSidebarProgress({ ...sidebarTxData, flow }),
    success: getSidebarSuccess({ ...sidebarTxData, flow }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
