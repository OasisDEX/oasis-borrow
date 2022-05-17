import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { getEditVaultButton } from 'features/sidebar/getEditVaultButton'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getResetButton } from 'features/sidebar/getResetButton'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { SideBarOpenBorrowVaultContent } from './SideBarOpenBorrowVaultContent'

interface SideBarOpenBorrowVaultProps {}

export function SideBarOpenBorrowVault(props: SideBarOpenBorrowVaultProps & OpenVaultState) {
  const { t } = useTranslation()
  const { accountData$ } = useAppContext()
  const [accountData] = useObservable(accountData$)

  const {
    stage,
    canProgress,
    progress,
    canRegress,
    regress,
    isEditingStage,
    isLoadingStage,
    token,
    totalSteps,
    currentStep,
    updateDeposit,
    inputAmountsEmpty,
  } = props

  const firstCDP = accountData?.numberOfVaults ? accountData.numberOfVaults === 0 : undefined

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ stage, token }),
    ...(isEditingStage &&
      !inputAmountsEmpty && {
        headerButton: getResetButton({
          t,
          callback: () => {
            updateDeposit!(undefined)
          },
        }),
      }),
    ...(canRegress && {
      headerButton: getEditVaultButton({
        t,
        regress,
        callback: () => {
          if (stage !== 'allowanceFailure') {
            trackingEvents.confirmVaultEdit(firstCDP)
          }
        },
      }),
    }),
    content: (
      <Grid gap={3}>
        {isEditingStage && <SideBarOpenBorrowVaultContent {...props} />}
        <VaultErrors {...props} />
        <VaultWarnings {...props} />
      </Grid>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ stage, token }),
      steps: [currentStep, totalSteps],
      disabled: !canProgress,
      isLoading: isLoadingStage,
      action: () => {
        progress!()
      },
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
