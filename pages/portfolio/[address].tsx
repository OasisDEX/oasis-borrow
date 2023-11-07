import { PortfolioLayout } from 'components/layouts/PortfolioLayout'
import { PortfolioHeader } from 'components/portfolio/PortfolioHeader'
import { PortfolioNonOwnerNotice } from 'components/portfolio/PortfolioNonOwnerNotice'
import { PortfolioOverview } from 'components/portfolio/PortfolioOverview'
import { PortfolioOverviewSkeleton } from 'components/portfolio/PortfolioOverviewSkeleton'
import { PortfolioPositionsView } from 'components/portfolio/positions/PortfolioPositionsView'
import { PortfolioWalletView } from 'components/portfolio/wallet/PortfolioWalletView'
import { TabBar } from 'components/TabBar'
import { usePortfolioClientData } from 'helpers/clients/portfolio-client-data'
import { useAccount } from 'helpers/useAccount'
import { useRedirect } from 'helpers/useRedirect'
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useEffect } from 'react'
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
      address,
      awsInfraUrl,
      awsInfraHeader,
    },
  }
}

export default function PortfolioView(props: PortfolioViewProps) {
  const { t: tPortfolio } = useTranslation('portfolio')
  const { replace } = useRedirect()
  const { walletAddress } = useAccount()

  const { address, awsInfraUrl, awsInfraHeader } = props
  const isOwner = address === walletAddress
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
    walletAddress,
  })

  // redirect
  useEffect(() => {
    if (!address) {
      replace('/')
    }
  }, [address, replace])

  return address ? (
    <PortfolioLayout>
      <Box sx={{ width: '100%' }}>
        {!isOwner &&
          walletAddress && ( // walletAddress prevents showing the notice when not connected
            <PortfolioNonOwnerNotice
              address={address}
              assets={portfolioConnectedWalletWalletData?.assets}
            />
          )}
        <PortfolioHeader address={address} />
        {overviewData && portfolioWalletData ? (
          <PortfolioOverview
            overviewData={overviewData}
            portfolioWalletData={portfolioWalletData}
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
                  portfolioPositionsData={portfolioPositionsData}
                  blogPosts={blogPosts}
                />
              ),
            },
            {
              value: 'wallet',
              label: tPortfolio('wallet-tab'),
              content: (
                <PortfolioWalletView
                  isOwner={isOwner}
                  address={address}
                  portfolioWalletData={portfolioWalletData}
                  blogPosts={blogPosts}
                />
              ),
            },
          ]}
        />
      </Box>
    </PortfolioLayout>
  ) : null
}
