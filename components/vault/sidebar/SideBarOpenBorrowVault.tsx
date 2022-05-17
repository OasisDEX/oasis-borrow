import { trackingEvents } from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { getEditVaultButton } from 'features/sidebar/getEditVaultButton'
import { getPrimaryButtonLabel } from 'features/sidebar/getPrimaryButtonLabel'
import { getSidebarTitle } from 'features/sidebar/getSidebarTitle'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { SideBarOpenBorrowVaultContent } from './SideBarOpenBorrowVaultContent'

interface SideBarOpenBorrowVaultProps {}

export function SideBarOpenBorrowVault(props: SideBarOpenBorrowVaultProps & OpenVaultState) {
  const { t } = useTranslation()
  const { accountData$ } = useAppContext()
  const [accountData] = useObservable(accountData$)

  const {
    stage,
    canProgress,
    canRegress,
    regress,
    isEditingStage,
    isLoadingStage,
    token,
    totalSteps,
    currentStep,
  } = props

  const firstCDP = accountData?.numberOfVaults ? accountData.numberOfVaults === 0 : undefined

  const sidebarSectionProps: SidebarSectionProps = {
    title: getSidebarTitle({ stage, token }),
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
      <>
        {isEditingStage && <SideBarOpenBorrowVaultContent {...props} />}
      </>
    ),
    primaryButton: {
      label: getPrimaryButtonLabel({ stage, token }),
      steps: [currentStep, totalSteps],
      disabled: !canProgress,
      isLoading: isLoadingStage,
      action: () => {
        alert('asd')
      },
    },
  }

  return <SidebarSection {...sidebarSectionProps} />
}
