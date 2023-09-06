import React, { useEffect } from 'react'
import { trackingEvents } from 'analytics/analytics'
import { useAccountContext, useMainContext, useProductContext } from 'components/context'
import { DefaultVaultHeader } from 'components/vault/DefaultVaultHeader'
import { OpenVaultDetails } from 'features/borrow/open/containers/OpenVaultDetails'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import { createOpenVaultAnalytics$ } from 'features/borrow/open/pipes/openVaultAnalytics'
import { SidebarOpenBorrowVault } from 'features/borrow/open/sidebars/SidebarOpenBorrowVault'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import { Box, Container, Grid } from 'theme-ui'

function OpenVaultForm(props: OpenVaultState) {
  return <SidebarOpenBorrowVault {...props} />
}

export function OpenVaultContainer(props: OpenVaultState) {
  const { ilk, clear } = props
  const { t } = useTranslation()

  useEffect(() => {
    return () => {
      clear()
    }
  }, [])

  return (
    <>
      <DefaultVaultHeader {...props} header={t('vault.open-vault', { ilk })} />
      <Grid variant="vaultContainer">
        <Box>
          <OpenVaultDetails {...props} />
        </Box>
        <Box>
          <OpenVaultForm {...props} />
        </Box>
      </Grid>
    </>
  )
}

export function OpenVaultView({ ilk }: { ilk: string }) {
  const { context$ } = useMainContext()
  const { accountData$ } = useAccountContext()
  const { openVault$ } = useProductContext()
  const openVaultWithIlk$ = openVault$(ilk)
  const [openVault, error] = useObservable(openVaultWithIlk$)

  useEffect(() => {
    const subscription = createOpenVaultAnalytics$(
      accountData$,
      openVaultWithIlk$,
      context$,
      trackingEvents,
    ).subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <WithErrorHandler error={error}>
      <WithLoadingIndicator value={openVault}>
        {(openVault) => (
          <Container variant="vaultPageContainer">
            <OpenVaultContainer {...openVault} />
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
