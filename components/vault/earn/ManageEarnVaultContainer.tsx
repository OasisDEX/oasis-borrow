import { trackingEvents } from 'analytics/trackingEvents'
import { useMainContext, useProductContext } from 'components/context'
import type { EarnVaultHeaderProps } from 'features/earn/guni/common/GuniVaultHeader'
import type { ManageEarnVaultState } from 'features/earn/guni/manage/pipes/manageGuniVault.types'
import { createManageMultiplyVaultAnalytics$ } from 'features/multiply/manage/pipes/manageMultiplyVaultAnalytics'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import { useAppConfig } from 'helpers/config'
import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

export interface ManageEarnVaultContainerProps {
  manageVault: ManageEarnVaultState
}

interface ManageEarnVaultContainerComponents {
  header: (props: EarnVaultHeaderProps) => JSX.Element
  details: (props: ManageEarnVaultState) => JSX.Element
  form: (props: ManageEarnVaultState) => JSX.Element
  history: (props: { vaultHistory: VaultHistoryEvent[] }) => JSX.Element
}

export function ManageEarnVaultContainer({
  manageVault,
  header: Header,
  details: Details,
  form: Form,
  history: History,
}: ManageEarnVaultContainerProps & ManageEarnVaultContainerComponents) {
  const { context$ } = useMainContext()
  const { manageGuniVault$ } = useProductContext()
  const {
    vault: { id },
    clear,
    ilkData,
  } = manageVault

  const { StopLossRead: stopLossReadEnabled } = useAppConfig('features')

  useEffect(() => {
    const subscription = createManageMultiplyVaultAnalytics$(
      manageGuniVault$(id),
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      !stopLossReadEnabled && clear()
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {!stopLossReadEnabled && <Header {...manageVault} token={ilkData.token} ilk={ilkData.ilk} />}
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          <Details {...manageVault} />
          {!stopLossReadEnabled && <History vaultHistory={manageVault.vaultHistory} />}
        </Grid>
        <Box>
          <Form {...manageVault} />
        </Box>
      </Grid>
    </>
  )
}
