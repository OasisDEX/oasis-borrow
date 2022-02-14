import BigNumber from 'bignumber.js'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import NotFoundPage from 'pages/404'
import React from 'react'
import { Box } from 'theme-ui'
import { BackgroundLight } from 'theme/BackgroundLight'

import { GeneralManageControl } from '../../components/vault/GeneralManageControl'
import { WithTermsOfService } from '../../features/termsOfService/TermsOfService'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      id: ctx.query.vault || null,
    },
  }
}

export default function Vault({ id }: { id: string }) {
  const vaultId = new BigNumber(id)
  const isValidVaultId = vaultId.isInteger() && vaultId.gt(0)

  return (
    <WithConnection>
      <WithTermsOfService>
        <BackgroundLight />
        {isValidVaultId ? (
          <GeneralManageControl id={vaultId} />
        ) : (
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <NotFoundPage />
          </Box>
        )}
      </WithTermsOfService>
    </WithConnection>
  )
}

Vault.layout = AppLayout
