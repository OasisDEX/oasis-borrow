import BigNumber from 'bignumber.js'
import {
  ethereumMainnetHexId,
  isSupportedNetwork,
  NetworkIds,
  NetworkNames,
} from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { AppLayout } from 'components/layouts/AppLayout'
import { GeneralManageControl } from 'components/vault/GeneralManageControl'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import NotFoundPage from 'pages/not-found'
import React from 'react'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const networkOrProduct = ctx.query.networkOrProduct as string
  if (isSupportedNetwork(networkOrProduct) && networkOrProduct === NetworkNames.ethereumMainnet) {
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
    <AppLayout>
      <ProductContextHandler networkId={NetworkIds.MAINNET}>
        <GasEstimationContextProvider>
          <WithConnection pageChainId={ethereumMainnetHexId} includeTestNet={true}>
            <WithTermsOfService>
              <WithWalletAssociatedRisk>
                {isValidVaultId ? <GeneralManageControl id={vaultId} /> : <NotFoundPage />}
              </WithWalletAssociatedRisk>
            </WithTermsOfService>
          </WithConnection>
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </AppLayout>
  )
}

export default Vault
