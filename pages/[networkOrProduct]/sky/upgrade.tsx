import { useConnectWallet } from '@web3-onboard/react'
import { skyDaiUsdsSwap, skyMkrSkySwap, skyUsdsSusdsVault } from 'blockchain/better-calls/sky'
import { mainnetContracts } from 'blockchain/contracts/mainnet'
import { ethereumMainnetHexId, NetworkIds } from 'blockchain/networks'
import { ActionBanner } from 'components/ActionBanner'
import { WithConnection } from 'components/connectWallet'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { useProductContext } from 'components/context/ProductContextProvider'
import { AppLayout } from 'components/layouts/AppLayout'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import type { SwapCardType } from 'features/sky/components/SwapCard'
import { SwapCard } from 'features/sky/components/SwapCard'
import { skySwapTokensConfig } from 'features/sky/config'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { formatAsShorthandNumbers } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { zero } from 'helpers/zero'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useMemo } from 'react'
import { Container, Grid } from 'theme-ui'

function SkySwapWrapper() {
  const [{ wallet }] = useConnectWallet()
  const { balancesFromAddressInfoArray$ } = useProductContext()
  const [balancesData] = useObservable(
    useMemo(
      () =>
        balancesFromAddressInfoArray$(
          [
            {
              address: mainnetContracts.tokens['USDS'].address,
              precision: 18,
            },
          ],
          wallet?.accounts[0].address,
          NetworkIds.MAINNET,
        ),
      [balancesFromAddressInfoArray$, wallet?.accounts],
    ),
  )
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
      {balancesData?.[0] && balancesData[0].isGreaterThan(zero) && (
        <ActionBanner
          title={`You have ${formatAsShorthandNumbers(balancesData[0])} USDS that can earn SKY or Chronicle Points`}
          lightText
          customCtaVariant="outlineSmall"
          cta={[
            {
              label: 'Get SKY Rewards',
              url: `/earn/srr/${wallet?.accounts[0].address}`,
            },
            {
              label: 'Earn Chronicle Points',
              url: `/earn/cle/${wallet?.accounts[0].address}`,
            },
          ]}
          sx={{
            backgroundImage: `url(${staticFilesRuntimeUrl('/static/img/sky-banner-background.png')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'bottom',
            color: 'white',
            my: 4,
          }}
        >
          Deposit you USDS in the SKY Ecosystem to earn Chronicle Points or SKY Rewards. Withdraw
          anytime.
        </ActionBanner>
      )}
      <Grid gap={3} columns={[1, 3]} mt={[1, 3]}>
        {skySwapTokensConfig.map((config) => (
          <SwapCard
            key={`swap-card-${config.primaryToken}-${config.secondaryToken}`}
            depositAction={depositActions[`${config.primaryToken}-${config.secondaryToken}`]}
            config={config}
          />
        ))}
      </Grid>
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
                  <SkySwapWrapper />
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
