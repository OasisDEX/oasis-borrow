import { useAppContext } from 'components/AppContextProvider'
import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { OpenVaultView } from 'features/openVault/OpenVaultView'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box, Grid, Spinner } from 'theme-ui'

import { WithTermsOfService } from '../../../features/termsOfService/TermsOfService'

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, ['common'])),
      ilk: ctx.query.ilk || null,
    },
  }
}

function IlkValidation({ ilk }: { ilk: string }) {
  const { t } = useTranslation()
  const { ilkValidation$ } = useAppContext()
  const ilkValidation = useObservable(ilkValidation$(ilk))

  if (!ilkValidation || ilkValidation.status === 'ilkValidationLoading') {
    return (
      <Grid sx={{ width: '100%', height: '50vh', justifyItems: 'center', alignItems: 'center' }}>
        <Spinner size={50} />
      </Grid>
    )
  }
  if (ilkValidation.status === 'ilkValidationFailure') {
    return (
      <Grid sx={{ width: '100%', height: '50vh', justifyItems: 'center', alignItems: 'center' }}>
        <Box>{t('vaults.ilk-does-not-exist', { ilk })}</Box>
      </Grid>
    )
  }

  return <OpenVaultView ilk={ilkValidation.ilk} />
}

export default function OpenVault({ ilk }: { ilk: string }) {
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <IlkValidation ilk={ilk} />
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout
