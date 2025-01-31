import { useConnectWallet } from '@web3-onboard/react'
import type BigNumber from 'bignumber.js'
import { mainnetContracts } from 'blockchain/contracts/mainnet'
import { NetworkIds } from 'blockchain/networks'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { useProductContext } from 'components/context/ProductContextProvider'
import { AppLayout } from 'components/layouts/AppLayout'
import { LazySummerBannerWithRaysHandling } from 'components/LazySummerBanner'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { VaultOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { SkyStakePositionView } from 'features/sky/components/stake/SkyStakePositionView'
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

const SkyStakeUsdsView = ({ walletAddress }: { walletAddress?: string }) => {
  const [{ wallet }] = useConnectWallet()
  const [reloadingTokenInfo, setReloadingTokenInfo] = useState(false)
  const [tempSkyStakeWalletData, setTempSkyWalletStakeData] = useState<{
    balance: BigNumber
    earned: BigNumber
  }>()
  const [tempSkyStakeData, setTempSkyStakeData] = useState<{
    apy: BigNumber
    totalUSDSLocked: BigNumber
  }>()
  const [tempBalancesData, setTempBalancesData] = useState<BigNumber[]>()
  const isOwner = wallet?.accounts[0]?.address.toLowerCase() === walletAddress?.toLowerCase()
  const {
    balancesFromAddressInfoArray$,
    allowanceForAccountEthers$,
    skyUsdsWalletStakeDetails$,
    skyUsdsStakeDetails$,
    tokenPriceUSD$,
  } = useProductContext()
  const [tokenPrices] = useObservable(useMemo(() => tokenPriceUSD$(['MKR']), [tokenPriceUSD$]))
  const [skyStakeWalletData, skyStakeWalletError] = useObservable(
    useMemo(
      () => (reloadingTokenInfo ? of(undefined) : skyUsdsWalletStakeDetails$(walletAddress)),
      [skyUsdsWalletStakeDetails$, walletAddress, reloadingTokenInfo],
    ),
  )
  const [skyStakeData, skyStakeError] = useObservable(
    useMemo(
      () => (reloadingTokenInfo ? of(undefined) : skyUsdsStakeDetails$(tokenPrices?.MKR)),
      [reloadingTokenInfo, skyUsdsStakeDetails$, tokenPrices?.MKR],
    ),
  )
  useEffect(() => {
    if (
      skyStakeWalletData &&
      !tempSkyStakeWalletData?.balance.isEqualTo(skyStakeWalletData.balance)
    ) {
      setTempSkyWalletStakeData(skyStakeWalletData)
    }
  }, [skyStakeWalletData, tempSkyStakeWalletData])
  useEffect(() => {
    if (skyStakeData && !tempSkyStakeData?.apy.isEqualTo(skyStakeData.apy)) {
      setTempSkyStakeData(skyStakeData)
    }
  }, [skyStakeData, tempSkyStakeData])
  const [balancesData, balancesError] = useObservable(
    useMemo(
      () =>
        reloadingTokenInfo
          ? of([undefined, undefined])
          : balancesFromAddressInfoArray$(
              [
                {
                  address: mainnetContracts.tokens['USDS'].address,
                  precision: 18,
                },
                {
                  address: mainnetContracts.tokens['SKY'].address,
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
    if (
      balancesData &&
      balancesData[0] &&
      balancesData[1] &&
      (!tempBalancesData?.[0].isEqualTo(balancesData[0]) ||
        !tempBalancesData?.[1].isEqualTo(balancesData[1]))
    ) {
      setTempBalancesData(balancesData as BigNumber[])
    }
  }, [balancesData, tempBalancesData])
  const [allowancesData, allowancesError] = useObservable(
    useMemo(
      () =>
        reloadingTokenInfo
          ? of([zero, zero])
          : combineLatest([
              allowanceForAccountEthers$(
                'USDS',
                mainnetContracts.sky.staking.address,
                NetworkIds.MAINNET,
              ),
              allowanceForAccountEthers$(
                'SKY',
                mainnetContracts.sky.staking.address,
                NetworkIds.MAINNET,
              ),
            ]),
      [allowanceForAccountEthers$, reloadingTokenInfo],
    ),
  )
  const [usdsBalance, skyBalance] = balancesData || [undefined, undefined]
  const [usdsAllowance, skyAllowance] = allowancesData || [undefined, undefined]
  return (
    <Container variant="vaultPageContainer">
      {walletAddress && (
        <LazySummerBannerWithRaysHandling isOwner={isOwner} address={walletAddress} />
      )}
      {!isOwner && walletAddress && (
        <Box mb={4}>
          <VaultOwnershipBanner account={wallet?.accounts[0]?.address} controller={walletAddress} />
        </Box>
      )}
      <VaultHeadline header={'Stake USDS'} tokens={['USDS']} details={[]} />
      <WithErrorHandler
        error={[allowancesError, balancesError, skyStakeError, skyStakeWalletError]}
      >
        <WithLoadingIndicator
          value={[
            usdsBalance || tempBalancesData?.[0],
            skyBalance || tempBalancesData?.[1],
            skyStakeData || tempSkyStakeData,
          ]}
          customLoader={<PositionLoadingState header={null} />}
        >
          {([_usdsBalance, _skyBalance, _skyStakeData]) => (
            <SkyStakePositionView
              usdsBalance={_usdsBalance}
              skyBalance={_skyBalance}
              usdsAllowance={usdsAllowance}
              skyAllowance={skyAllowance}
              skyStakeWalletData={skyStakeWalletData}
              skyStakeData={_skyStakeData}
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

const SkyStakeUsdsViewWrapper = ({ walletAddress }: { walletAddress?: string }) => {
  return (
    <AppLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <WithTermsOfService>
            <WithWalletAssociatedRisk>
              <SkyStakeUsdsView walletAddress={walletAddress} />
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
export default SkyStakeUsdsViewWrapper
