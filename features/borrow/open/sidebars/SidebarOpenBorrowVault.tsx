import { ALLOWED_MULTIPLY_TOKENS } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarVaultAllowanceStage } from 'components/vault/sidebar/SidebarVaultAllowanceStage'
import { SidebarVaultProxyStage } from 'components/vault/sidebar/SidebarVaultProxyStage'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarStatus } from 'features/sidebar/getSidebarStatus'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { getTextButtonLabel } from 'features/sidebar/getTextButtonLabel'
import { progressTrackingEvent, regressTrackingEvent } from 'features/sidebar/trackingEvents'
import { SidebarFlow } from 'features/types/vaults/sidebarLabels'
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

import { SidebarOpenBorrowVaultEditingStage } from './SidebarOpenBorrowVaultEditingStage'
import { SidebarOpenBorrowVaultOpenStage } from './SidebarOpenBorrowVaultOpenStage'

export function SidebarOpenBorrowVault(props: OpenVaultState) {
  const { t } = useTranslation()
  const { accountData$ } = useAppContext()
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
    skipStopLoss,
    stage,
    token,
    totalSteps,
  } = props

  const flow: SidebarFlow = !isStopLossEditingStage ? 'openBorrow' : 'addSl'
  const firstCDP = isFirstCdp(accountData)
  const canTransition = ALLOWED_MULTIPLY_TOKENS.includes(token)
  const gasData = extractGasDataFromState(props)
  const primaryButtonLabelParams = extractPrimaryButtonLabelParams(props)
  const sidebarTxData = extractSidebarTxData(props)

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ flow, stage, token }),
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarOpenBorrowVaultEditingStage {...props} />}
        {isStopLossEditingStage && <>STOP LOSS BRO</>}
        {isProxyStage && <SidebarVaultProxyStage stage={stage} gasData={gasData} />}
        {isAllowanceStage && <SidebarVaultAllowanceStage {...props} />}
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
    status: getSidebarStatus({ flow, ...sidebarTxData }),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
