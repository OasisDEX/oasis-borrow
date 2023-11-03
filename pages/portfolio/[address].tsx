import { PortfolioLayout } from 'components/layouts/PortfolioLayout'
import { PortfolioHeader } from 'components/portfolio/PortfolioHeader'
import { PortfolioOverview } from 'components/portfolio/PortfolioOverview'
import { PortfolioOverviewSkeleton } from 'components/portfolio/PortfolioOverviewSkeleton'
import { PositionsView } from 'components/portfolio/positions/PositionsView'
import { WalletView } from 'components/portfolio/wallet/WalletView'
import { TabBar } from 'components/TabBar'
import { useRedirect } from 'helpers/useRedirect'
import type { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getAwsInfraHeader, getAwsInfraUrl } from 'pages/serverside-helpers'
import React, { useEffect } from 'react'
import { Box } from 'theme-ui'
import { useFetch } from 'usehooks-ts'

import type { PortfolioOverviewResponse } from 'lambdas/src/portfolio-overview/types'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const address = ctx.query.address
  const awsInfraUrl = getAwsInfraUrl()
  const awsInfraHeader = getAwsInfraHeader()

  return {
    props: {
      ...(await serverSideTranslations(ctx.locale ?? 'en', ['portfolio', 'common'])),
      address,
      awsInfraUrl,
      awsInfraHeader,
    },
  }
}

export default function PortfolioView({
  address,
  awsInfraUrl,
  awsInfraHeader,
}: {
  address: string
  awsInfraUrl: string
  awsInfraHeader: Record<string, string>
}) {
  const { t: tPortfolio } = useTranslation('portfolio')
  const { replace } = useRedirect()

  const { data: overviewData } = useFetch<PortfolioOverviewResponse>(
    `${awsInfraUrl}/portfolio-overview?address=${address}`,
    {
      headers: awsInfraHeader,
    },
  )

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
          <PortfolioOverview overviewData={overviewData} />
        ) : (
          <PortfolioOverviewSkeleton />
        )}
        <TabBar
          variant="underline"
          useDropdownOnMobile
          sections={[
            {
              value: 'positions',
              label: tPortfolio('positions-tab'),
              content: <PositionsView address={address} />,
            },
            {
              value: 'wallet',
              label: tPortfolio('wallet-tab'),
              content: <WalletView address={address} />,
            },
          ]}
        />
      </Box>
    </PortfolioLayout>
  ) : null
}
