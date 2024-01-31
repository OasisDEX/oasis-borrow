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
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
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
        destination: '/not-found',
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

export default function PortfolioView(props: PortfolioViewProps) {
  const { t: tPortfolio } = useTranslation('portfolio')
  const { replace } = useRedirect()
  const { isConnected, walletAddress } = useAccount()
  const { AjnaSafetySwitch: ajnaSafetySwitchOn } = useAppConfig('features')

  const { address, awsInfraUrl, awsInfraHeader } = props

  // loading migrations on load
  const [migrationPositions, setMigrationPositions] = React.useState<PortfolioPosition[] | void>(
    undefined,
  )
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
  ) : null
}
