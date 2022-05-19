import { trackingEvents } from 'analytics/analytics'
import { ALLOWED_MULTIPLY_TOKENS } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { getHeaderButton } from 'features/sidebar/getHeaderButton'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarProgress } from 'features/sidebar/getSidebarProgress'
import { getSidebarSuccess } from 'features/sidebar/getSidebarSuccess'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
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
    id,
    stage,
    canProgress,
    progress,
    canRegress,
    regress,
    isEditingStage,
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

  const firstCDP = accountData?.numberOfVaults ? accountData.numberOfVaults === 0 : undefined

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ stage, token }),
    headerButton: getHeaderButton({
      canResetForm: isEditingStage && !inputAmountsEmpty,
      resetForm: () => {
        updateDeposit!(undefined)
      },
      canRegress,
      regress,
      regressCallback: () => {
        if (stage !== 'allowanceFailure') {
          trackingEvents.confirmVaultEdit(firstCDP)
        }
      },
    }),
    content: (
      <Grid gap={3}>
        {isEditingStage && <SidebarOpenBorrowVaultEditingStage {...props} />}
        {isOpenStage && <SidebarOpenBorrowVaultOpenStage {...props} />}
        <VaultErrors {...props} />
        <VaultWarnings {...props} />
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel(props),
      steps: !isSuccessStage ? [currentStep, totalSteps] : undefined,
      disabled: !canProgress,
      isLoading: isLoadingStage,
      action: () => {
        if (!isSuccessStage) progress!()
      },
      url: isSuccessStage ? `/${id}` : undefined,
    },
    ...(isEditingStage &&
      ALLOWED_MULTIPLY_TOKENS.includes(token) && {
        textButton: {
          label: t('system.actions.borrow.switch-to-multiply'),
          url: `/vaults/open-multiply/${ilk}`,
        },
      }),
    progress: getSidebarProgress(props),
    success: getSidebarSuccess(props),
  }

  return <SidebarSection {...sidebarSectionProps} />
}
