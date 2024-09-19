import { useConnectWallet } from '@web3-onboard/react'
import type BigNumber from 'bignumber.js'
import { mainnetContracts } from 'blockchain/contracts/mainnet'
import { ethereumMainnetHexId, NetworkIds } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { useProductContext } from 'components/context/ProductContextProvider'
import { AppLayout } from 'components/layouts/AppLayout'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { VaultOwnershipBanner } from 'features/notices/VaultsNoticesView'
import { SkyStakePositionView } from 'features/sky/components/stake/SkyStakePositionView'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useEffect, useMemo, useState } from 'react'
import { combineLatest, of } from 'rxjs'
import { Box, Container } from 'theme-ui'

const SkyStakeUsdsView = ({ walletAddress }: { walletAddress: string }) => {
  const [{ wallet }] = useConnectWallet()
  const [reloadingTokenInfo, setReloadingTokenInfo] = useState(false)
  const [tempSkyStakeData, setTempSkyStakeData] = useState<{
    balance: BigNumber
    earned: BigNumber
    rewardRate: BigNumber
    totalUSDSLocked: BigNumber
  }>()
  const [tempBalancesData, setTempBalancesData] = useState<BigNumber[]>()
  const isOwner = wallet?.accounts[0]?.address.toLowerCase() === walletAddress.toLowerCase()
  const { balancesFromAddressInfoArray$, allowanceForAccountEthers$, skyUsdsWalletStakeDetails$ } =
    useProductContext()
  const [skyStakeData, skyStakeError] = useObservable(
    useMemo(
      () => (reloadingTokenInfo ? of(undefined) : skyUsdsWalletStakeDetails$(walletAddress)),
      [skyUsdsWalletStakeDetails$, walletAddress, reloadingTokenInfo],
    ),
  )
  useEffect(() => {
    if (skyStakeData && !tempSkyStakeData?.balance.isEqualTo(skyStakeData.balance)) {
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
      {!isOwner && (
        <Box mb={4}>
          <VaultOwnershipBanner account={wallet?.accounts[0]?.address} controller={walletAddress} />
        </Box>
      )}
      <VaultHeadline header={'Stake USDS'} tokens={['USDS']} details={[]} />
      <WithErrorHandler error={[allowancesError, balancesError, skyStakeError]}>
        <WithLoadingIndicator
          value={[
            usdsBalance || tempBalancesData?.[0],
            skyBalance || tempBalancesData?.[1],
            usdsAllowance,
            skyAllowance,
            skyStakeData || tempSkyStakeData,
          ]}
          customLoader={<VaultContainerSpinner />}
        >
          {([_usdsBalance, _skyBalance, _usdsAllowance, _skyAllowance, _skyStakeData]) => (
            <SkyStakePositionView
              usdsBalance={_usdsBalance}
              skyBalance={_skyBalance}
              usdsAllowance={_usdsAllowance}
              skyAllowance={_skyAllowance}
              skyStakeData={_skyStakeData}
              isOwner={isOwner}
              reloadingTokenInfo={reloadingTokenInfo}
              setReloadingTokenInfo={setReloadingTokenInfo}
            />
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Container>
  )
}

const SkyStakeUsdsViewWrapper = ({ walletAddress }: { walletAddress: string }) => {
  return (
    <AppLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <WithConnection pageChainId={ethereumMainnetHexId} includeTestNet={true}>
            <WithTermsOfService>
              <WithWalletAssociatedRisk>
                <SkyStakeUsdsView walletAddress={walletAddress} />
              </WithWalletAssociatedRisk>
            </WithTermsOfService>
          </WithConnection>
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
