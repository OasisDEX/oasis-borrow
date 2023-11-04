import { PortfolioLayout } from 'components/layouts/PortfolioLayout'
import { PortfolioHeader } from 'components/portfolio/PortfolioHeader'
import { PortfolioOverview } from 'components/portfolio/PortfolioOverview'
import { PortfolioOverviewSkeleton } from 'components/portfolio/PortfolioOverviewSkeleton'
import { PortfolioPositionsView } from 'components/portfolio/positions/PortfolioPositionsView'
import { PortfolioWalletView } from 'components/portfolio/wallet/PortfolioWalletView'
import { TabBar } from 'components/TabBar'
import { usePortfolioClient } from 'helpers/clients/portfolio-client'
import { useRedirect } from 'helpers/useRedirect'
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useEffect, useState } from 'react'
import { getAwsInfraHeader, getAwsInfraUrl } from 'server/helpers'
import { Box } from 'theme-ui'

import type { PortfolioOverviewResponse } from 'lambdas/src/shared/domain-types'

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

  const { address, awsInfraUrl, awsInfraHeader } = props

  const portfolioClient = usePortfolioClient(awsInfraUrl, awsInfraHeader)

  // fetch data
  const [overviewData, setOverviewData] = useState<PortfolioOverviewResponse>()
  useEffect(() => {
    void portfolioClient.fetchPortfolioOverview(address).then((data) => {
      setOverviewData(data)
    })
  }, [address, portfolioClient])

  // redirect
  useEffect(() => {
    if (!address) {
      replace('/')
    }
  }, [address, replace])

  return address ? (
    <PortfolioLayout>
      <Box sx={{ width: '100%' }}>
        <PortfolioHeader address={address} />
        {overviewData ? (
          <PortfolioOverview address={address} overviewData={overviewData} />
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
                  fetchData={portfolioClient.fetchPortfolioPositions}
                />
              ),
            },
            {
              value: 'wallet',
              label: tPortfolio('wallet-tab'),
              content: (
                <PortfolioWalletView
                  address={address}
                  fetchData={portfolioClient.fetchPortfolioAssets}
                />
              ),
            },
          ]}
        />
      </Box>
    </PortfolioLayout>
  ) : null
}
