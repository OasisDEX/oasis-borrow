import BigNumber from 'bignumber.js'
import { WithConnection } from 'components/connectWallet'
import { AppLayout } from 'components/Layouts'
import { GeneralManageControl } from 'components/vault/GeneralManageControl'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { isSupportedNetwork, NetworkNames } from 'helpers/networkNames'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import NotFoundPage from 'pages/not-found'
import React from 'react'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const network = ctx.query.network as string
  if (isSupportedNetwork(network) && network === NetworkNames.ethereumMainnet) {
    return {
      props: {
        ...(await serverSideTranslations(ctx.locale!, ['common'])),
        id: ctx.query.vault || null,
      },
    }
  } else {
    return {
      redirect: {
        permanent: false,
        destination: '/not-found',
      },
    }
  }
}

function Vault({ id }: { id: string }) {
  const vaultId = new BigNumber(id)
  const isValidVaultId = vaultId.isInteger() && vaultId.gt(0)

  return (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          {isValidVaultId ? <GeneralManageControl id={vaultId} /> : <NotFoundPage />}
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  )
}

Vault.layout = AppLayout

export default Vault
