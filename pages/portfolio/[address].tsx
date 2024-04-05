import { Announcement } from 'components/Announcement'
import { PortfolioLayout } from 'components/layouts/PortfolioLayout'
import { PortfolioHeader } from 'components/portfolio/PortfolioHeader'
import { PortfolioNonOwnerNotice } from 'components/portfolio/PortfolioNonOwnerNotice'
import { PortfolioOverview } from 'components/portfolio/PortfolioOverview'
import { PortfolioOverviewSkeleton } from 'components/portfolio/PortfolioOverviewSkeleton'
import { PortfolioPositionsView } from 'components/portfolio/positions/PortfolioPositionsView'
import { PortfolioWalletView } from 'components/portfolio/wallet/PortfolioWalletView'
import { TabBar } from 'components/TabBar'
import { MigrationsContext } from 'features/migrations/context'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { usePortfolioClientData } from 'helpers/clients/portfolio-client-data'
import { useAppConfig } from 'helpers/config'
import { useAccount } from 'helpers/useAccount'
import { useRedirect } from 'helpers/useRedirect'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useContext, useEffect } from 'react'
import { getAwsInfraHeader, getAwsInfraUrl } from 'server/helpers'
import { Box } from 'theme-ui'
import {
  RefinanceContextInput,
  RefinanceContextProvider,
} from 'features/refinance/RefinanceContext'
import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ModalProvider } from 'helpers/modalHook'
import { ProductContextProvider } from 'components/context/ProductContextProvider'

type PortfolioViewProps = {
  address: string
  awsInfraUrl: string
  awsInfraHeader: Record<string, string>
}

export async function getServerSideProps(
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<PortfolioViewProps>> {
  const address = ctx.query.address
  let awsInfraUrl
  let awsInfraHeader

  try {
    awsInfraUrl = getAwsInfraUrl()
    awsInfraHeader = getAwsInfraHeader()
    if (address == null || Array.isArray(address)) {
      throw new Error('Address is required')
    }
  } catch (e) {
    console.error(e)
    return {
      redirect: {
        destination: INTERNAL_LINKS.notFound,
        permanent: false,
      },
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(ctx.locale ?? 'en', ['portfolio', 'common'])),
      address: address.toLowerCase(),
      awsInfraUrl,
      awsInfraHeader,
    },
  }
}

// TODO check if there is a way to avoid passing dummy input
export const dummyCtxInput: RefinanceContextInput = {
  poolData: {
    // @ts-ignore
    poolId: '0x0',
    borrowRate: '0.1',
    collateralTokenSymbol: 'ETH',
    debtTokenSymbol: 'DAI',
    maxLtv: new RiskRatio(new BigNumber(0.85), RiskRatio.TYPE.LTV),
  },
  environment: {
    tokenPrices: {
      ETH: '3000',
      DAI: '1',
    },
    chainId: 1,
    slippage: 0.002,
    address: '0x0',
  },
  position: {
    positionId: {
      id: '12312',
    },
    collateralAmount: '3',
    debtAmount: '2000',
    liquidationPrice: '2500',
    ltv: new RiskRatio(new BigNumber(0.65), RiskRatio.TYPE.LTV),
  },
  automations: {},
}

export default function PortfolioView(props: PortfolioViewProps) {
  const { t: tPortfolio } = useTranslation('portfolio')
  const { replace } = useRedirect()
  const { isConnected, walletAddress } = useAccount()
  const { AjnaSafetySwitch: ajnaSafetySwitchOn } = useAppConfig('features')

  const { address, awsInfraUrl, awsInfraHeader } = props

  // loading migrations on load
  const [migrationPositions, setMigrationPositions] = React.useState<
    PortfolioPosition[] | undefined
  >(undefined)
  const { fetchMigrationPositions } = useContext(MigrationsContext)
  useEffect(() => {
    void fetchMigrationPositions(address).then((data) => setMigrationPositions(data))
  }, [address, fetchMigrationPositions])

  // redirect
  useEffect(() => {
    if (!address) {
      replace('/')
    }
  }, [address, replace])
  const {
    overviewData,
    portfolioConnectedWalletWalletData,
    portfolioPositionsData,
    portfolioWalletData,
    blogPosts,
  } = usePortfolioClientData({
    address,
    awsInfraHeader,
    awsInfraUrl,
  })
  const isOwner = !!walletAddress && address === walletAddress.toLowerCase()
  const hasAjnaPositions = portfolioPositionsData?.positions.some(
    (position) => position.protocol === LendingProtocol.Ajna,
  )

  return address ? (
    <ProductContextProvider>
      <RefinanceContextProvider>
        <ModalProvider>
          <PortfolioLayout>
            <Box sx={{ width: '100%' }}>
              {ajnaSafetySwitchOn && isOwner && hasAjnaPositions && (
                <Announcement
                  text={tPortfolio('ajna-warning')}
                  discordLink={EXTERNAL_LINKS.DISCORD}
                  link="https://blog.summer.fi/ajna-possible-attack-vector/"
                  linkText="Read more"
                  withClose={false}
                />
              )}
              <PortfolioNonOwnerNotice
                address={address}
                connectedAssets={portfolioConnectedWalletWalletData?.assets}
                isConnected={isConnected}
                isOwner={isOwner}
                ownerAssets={portfolioWalletData?.assets}
              />
              <PortfolioHeader address={address} />
              {overviewData && portfolioWalletData ? (
                <PortfolioOverview
                  address={address}
                  overviewData={overviewData}
                  portfolioWalletData={portfolioWalletData}
                  migrationPositions={migrationPositions}
                />
              ) : (
                <PortfolioOverviewSkeleton />
              )}
              <TabBar
                variant="underline"
                sections={[
                  {
                    value: 'positions',
                    label: tPortfolio('positions-tab'),
                    content: (
                      <PortfolioPositionsView
                        address={address}
                        blogPosts={blogPosts}
                        isOwner={isOwner}
                        portfolioPositionsData={portfolioPositionsData}
                        portfolioWalletData={portfolioWalletData}
                        migrationPositions={migrationPositions}
                      />
                    ),
                  },
                  {
                    value: 'wallet',
                    label: tPortfolio('wallet-tab'),
                    content: (
                      <PortfolioWalletView
                        address={address}
                        blogPosts={blogPosts}
                        isOwner={isOwner}
                        portfolioWalletData={portfolioWalletData}
                      />
                    ),
                  },
                ]}
              />
            </Box>
          </PortfolioLayout>
        </ModalProvider>
      </RefinanceContextProvider>
    </ProductContextProvider>
  ) : null
}
