import { useConnectWallet } from '@web3-onboard/react'
import type BigNumber from 'bignumber.js'
import { mainnetContracts } from 'blockchain/contracts/mainnet'
import { NetworkIds } from 'blockchain/networks'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { useProductContext } from 'components/context/ProductContextProvider'
import { AppLayout } from 'components/layouts/AppLayout'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { VaultOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { SkyCLEPositionView } from 'features/sky/components/stake/SkyCLEPositionView'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useEffect, useMemo, useState } from 'react'
import { combineLatest, of } from 'rxjs'
import { Box, Container } from 'theme-ui'

const SkyCleStakeUsdsView = ({ walletAddress }: { walletAddress?: string }) => {
  const [{ wallet }] = useConnectWallet()
  const [reloadingTokenInfo, setReloadingTokenInfo] = useState(false)
  const [tempSkyCleStakeWalletData, setTempSkyWalletStakeData] = useState<{
    balance: BigNumber
    totalUSDSLocked: BigNumber
  }>()
  const [tempBalancesData, setTempBalancesData] = useState<BigNumber[]>()
  const isOwner = wallet?.accounts[0]?.address.toLowerCase() === walletAddress?.toLowerCase()
  const {
    balancesFromAddressInfoArray$,
    allowanceForAccountEthers$,
    skyUsdsWalletStakeCleDetails$,
  } = useProductContext()
  const [skyCleStakeWalletData, skyCleStakeWalletError] = useObservable(
    useMemo(
      () => (reloadingTokenInfo ? of(undefined) : skyUsdsWalletStakeCleDetails$(walletAddress)),
      [skyUsdsWalletStakeCleDetails$, walletAddress, reloadingTokenInfo],
    ),
  )
  useEffect(() => {
    if (
      skyCleStakeWalletData &&
      !tempSkyCleStakeWalletData?.balance.isEqualTo(skyCleStakeWalletData.balance)
    ) {
      setTempSkyWalletStakeData(skyCleStakeWalletData)
    }
  }, [skyCleStakeWalletData, tempSkyCleStakeWalletData])

  const [balancesData, balancesError] = useObservable(
    useMemo(
      () =>
        reloadingTokenInfo
          ? of([undefined])
          : balancesFromAddressInfoArray$(
              [
                {
                  address: mainnetContracts.tokens['USDS'].address,
                  precision: 18,
                },
              ],
              walletAddress,
              NetworkIds.MAINNET,
            ),
      [balancesFromAddressInfoArray$, walletAddress, reloadingTokenInfo],
    ),
  )
  useEffect(() => {
    if (balancesData && balancesData[0] && !tempBalancesData?.[0].isEqualTo(balancesData[0])) {
      setTempBalancesData(balancesData as BigNumber[])
    }
  }, [balancesData, tempBalancesData])
  const [allowancesData, allowancesError] = useObservable(
    useMemo(
      () =>
        reloadingTokenInfo
          ? of([zero])
          : combineLatest([
              allowanceForAccountEthers$(
                'USDS',
                mainnetContracts.sky.stakingCle.address,
                NetworkIds.MAINNET,
              ),
            ]),
      [allowanceForAccountEthers$, reloadingTokenInfo],
    ),
  )
  const [usdsBalance] = balancesData || [undefined]
  const [usdsAllowance] = allowancesData || [undefined]
  return (
    <Container variant="vaultPageContainer">
      {!isOwner && walletAddress && (
        <Box mb={4}>
          <VaultOwnershipBanner account={wallet?.accounts[0]?.address} controller={walletAddress} />
        </Box>
      )}
      <VaultHeadline header={'Earn Chronicle Points'} tokens={['USDS', 'CLE']} details={[]} />
      <WithErrorHandler error={[allowancesError, balancesError, skyCleStakeWalletError]}>
        <WithLoadingIndicator
          value={[usdsBalance || tempBalancesData?.[0]]}
          customLoader={<PositionLoadingState header={null} />}
        >
          {([_usdsBalance]) => (
            <SkyCLEPositionView
              usdsBalance={_usdsBalance}
              usdsAllowance={usdsAllowance}
              skyCleStakeWalletData={skyCleStakeWalletData}
              isOwner={isOwner}
              reloadingTokenInfo={reloadingTokenInfo}
              setReloadingTokenInfo={setReloadingTokenInfo}
              viewWalletAddress={walletAddress}
            />
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Container>
  )
}

const SkyCleStakeUsdsViewWrapper = ({ walletAddress }: { walletAddress?: string }) => {
  return (
    <AppLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <WithTermsOfService>
            <WithWalletAssociatedRisk>
              <SkyCleStakeUsdsView walletAddress={walletAddress} />
            </WithWalletAssociatedRisk>
          </WithTermsOfService>
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </AppLayout>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      walletAddress: ctx.query.wallet || null,
    },
  }
}
export default SkyCleStakeUsdsViewWrapper
