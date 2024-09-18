import { useConnectWallet } from '@web3-onboard/react'
import { skyDaiUsdsSwap, skyMkrSkySwap, skyUsdsSusdsVault } from 'blockchain/better-calls/sky-swaps'
import { ethereumMainnetHexId } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { AppLayout } from 'components/layouts/AppLayout'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import type { SwapCardType } from 'features/sky/components/SwapCard'
import { SwapCard } from 'features/sky/components/SwapCard'
import { skySwapTokensConfig } from 'features/sky/config'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Container, Grid } from 'theme-ui'

function SkySwapWrapper() {
  const [{ wallet }] = useConnectWallet()
  const depositActions = {
    'DAI-USDS': (params) => {
      if (!wallet?.accounts[0].address) {
        return new Promise(() => {})
      }
      return skyDaiUsdsSwap({
        token: params.resolvedPrimaryTokenData.token,
        amount: params.amount,
        signer: params.signer,
      })
    },
    'MKR-SKY': (params) => {
      if (!wallet?.accounts[0].address) {
        return new Promise(() => {})
      }
      return skyMkrSkySwap({
        token: params.resolvedPrimaryTokenData.token,
        amount: params.amount,
        signer: params.signer,
      })
    },
    'USDS-SUSDS': (params) => {
      if (!wallet?.accounts[0].address) {
        return new Promise(() => {})
      }
      return skyUsdsSusdsVault({
        token: params.resolvedPrimaryTokenData.token,
        amount: params.amount,
        signer: params.signer,
      })
    },
  } as Record<string, SwapCardType['depositAction']>
  return (
    <>
      {skySwapTokensConfig.map((config) => (
        <SwapCard
          key={`swap-card-${config.primaryToken}-${config.secondaryToken}`}
          depositAction={depositActions[`${config.primaryToken}-${config.secondaryToken}`]}
          config={config}
        />
      ))}
    </>
  )
}

function SkySwapPage() {
  return (
    <AppLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <WithConnection pageChainId={ethereumMainnetHexId} includeTestNet={true}>
            <WithTermsOfService>
              <WithWalletAssociatedRisk>
                <Container variant="vaultPageContainer">
                  <VaultHeadline
                    header={'Sky Ecosystem Token Upgrades'}
                    tokens={['SKY', 'USDS', 'SUSDS']}
                    details={[]}
                  />
                  <Grid gap={3} columns={3} mt={[1, 3]}>
                    <SkySwapWrapper />
                  </Grid>
                </Container>
              </WithWalletAssociatedRisk>
            </WithTermsOfService>
          </WithConnection>
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </AppLayout>
  )
}

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export async function getStaticPaths() {
  return {
    paths: ['/ethereum/sky/upgrade'],
    fallback: true,
  }
}

export default SkySwapPage
