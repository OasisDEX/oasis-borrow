import React, { useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { trackingEvents } from '../../../analytics/analytics'
import { EarnVaultHeaderProps } from '../../../features/earn/guni/common/GuniVaultHeader'
import { ManageEarnVaultState } from '../../../features/earn/guni/manage/pipes/manageGuniVault'
import { createManageMultiplyVaultAnalytics$ } from '../../../features/multiply/manage/pipes/manageMultiplyVaultAnalytics'
import { VaultHistoryEvent } from '../../../features/vaultHistory/vaultHistory'
import { useFeatureToggle } from '../../../helpers/useFeatureToggle'
import { useAppContext } from '../../AppContextProvider'

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
  const { context$, manageGuniVault$ } = useAppContext()
  const {
    vault: { id },
    clear,
    ilkData,
  } = manageVault

  const stopLossReadEnabled = useFeatureToggle('StopLossRead')

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
