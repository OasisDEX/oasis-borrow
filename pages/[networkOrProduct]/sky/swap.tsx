import { useConnectWallet } from '@web3-onboard/react'
import { skyDaiUsdsSwap } from 'blockchain/better-calls/sky-swaps'
import { getNetworkContracts } from 'blockchain/contracts'
import { ethereumMainnetHexId } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { useProductContext } from 'components/context/ProductContextProvider'
import { AppLayout } from 'components/layouts/AppLayout'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { SwapCard } from 'features/sky/components/SwapCard'
import type { SkyTokensSwapType } from 'features/sky/components/types'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React, { useMemo, useState } from 'react'
import { combineLatest, of } from 'rxjs'
import { Container, Grid } from 'theme-ui'

const contracts = getNetworkContracts(1)
const skySwapTokensConfig = [
  {
    address: contracts.tokens['DAI'].address,
    precision: 18,
  },
  {
    address: contracts.tokens['MKR'].address,
    precision: 18,
  },
  {
    address: contracts.tokens['USDS'].address,
    precision: 18,
  },
  {
    address: contracts.tokens['SKY'].address,
    precision: 18,
  },
  {
    address: contracts.tokens['SUSDS'].address,
    precision: 18,
  },
]

function SkySwapWrapper() {
  const [{ wallet }] = useConnectWallet()
  const { balancesFromAddressInfoArray$, allowanceForAccountEthers$ } = useProductContext()
  const [isLoadingAllowance, setIsLoadingAllowance] = useState(false)
  const [balancesInfoArrayData, balancesInfoArrayError] = useObservable(
    useMemo(
      () =>
        isLoadingAllowance
          ? of(skySwapTokensConfig.map(() => zero))
          : balancesFromAddressInfoArray$(skySwapTokensConfig, wallet?.accounts[0].address, 1),
      [balancesFromAddressInfoArray$, wallet?.accounts, isLoadingAllowance],
    ),
  )
  const [allowancesInfoArrayData, allowancesInfoArrayError] = useObservable(
    useMemo(
      () =>
        isLoadingAllowance
          ? of(skySwapTokensConfig.map(() => zero))
          : combineLatest(
              skySwapTokensConfig.map(({ address }) =>
                allowanceForAccountEthers$(address, wallet?.accounts[0].address || '', 1),
              ),
            ),
      [allowanceForAccountEthers$, wallet?.accounts, isLoadingAllowance],
    ),
  )
  const depositActions = {
    daiusds: (params) => () => {
      if (!wallet?.accounts[0].address) {
        return
      }
      skyDaiUsdsSwap({
        token: params.resolvedPrimaryTokenData.token as 'DAI' | 'USDS',
        amount: params.amount,
        signer: params.signer,
      })
        .then((tx) => {
          console.log('tx', tx)
        })
        .catch((error) => {
          console.error('skyDaiUsdsSwap error', error)
        })
    },
    mkrsky: (params) => () => {
      console.log('mkrsky depositAction', params)
    },
    usdssusds: (params) => () => {
      console.log('usdssusds depositAction', params)
    },
  } as Record<string, SkyTokensSwapType['depositAction']>
  return (
    <WithErrorHandler error={[balancesInfoArrayError, allowancesInfoArrayError]}>
      <WithLoadingIndicator value={[balancesInfoArrayData, allowancesInfoArrayData]}>
        {([balances, allowances]) => {
          const [daiBalance, mkrBalance, usdsBalance, skyBalance, susdsBalance] = balances
          const [daiAllowance, mkrAllowance, usdsAllowance, skyAllowance, susdsAllowance] =
            allowances
          const commonProps = {
            walletAddress: wallet?.accounts[0].address,
            setIsLoadingAllowance,
            isLoadingAllowance,
          }
          return (
            <>
              <SwapCard
                primaryToken="DAI"
                secondaryToken="USDS"
                primaryTokenBalance={daiBalance}
                primaryTokenAllowance={daiAllowance}
                secondaryTokenBalance={usdsBalance}
                secondaryTokenAllowance={usdsAllowance}
                depositAction={depositActions.daiusds}
                {...commonProps}
              />
              <SwapCard
                primaryToken="MKR"
                secondaryToken="SKY"
                primaryTokenBalance={mkrBalance}
                primaryTokenAllowance={mkrAllowance}
                secondaryTokenBalance={skyBalance}
                secondaryTokenAllowance={skyAllowance}
                depositAction={depositActions.mkrsky}
                {...commonProps}
              />
              <SwapCard
                primaryToken="USDS"
                secondaryToken="SUSDS"
                primaryTokenBalance={usdsBalance}
                primaryTokenAllowance={usdsAllowance}
                secondaryTokenBalance={susdsBalance}
                secondaryTokenAllowance={susdsAllowance}
                depositAction={depositActions.usdssusds}
                {...commonProps}
              />
            </>
          )
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
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
                  <VaultHeadline header={'SKY Token swap'} tokens={['DAI']} details={[]} />
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

export default SkySwapPage
