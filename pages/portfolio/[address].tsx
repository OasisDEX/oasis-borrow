import { PortfolioLayout } from 'components/layouts/PortfolioLayout'
import { PortfolioHeader } from 'components/portfolio/PortfolioHeader'
import { PortfolioOverview } from 'components/portfolio/PortfolioOverview'
import type { PortfolioAssetsReply, PortfolioPositionsReply } from 'features/portfolio/types'
import { useRedirect } from 'helpers/useRedirect'
import type { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getAwsInfraHeader, getAwsInfraUrl } from 'pages/serverside-helpers'
import React, { useEffect } from 'react'
import { Box, Flex } from 'theme-ui'
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
  useEffect(() => {
    if (!address) {
      replace('/')
    }
  }, [address, replace])
  const { data: portfolioPositionsData = { positions: [] } } = useFetch<PortfolioPositionsReply>(
    `/api/portfolio/positions/${address}`,
  )
  const { data: portfolioWalletData } = useFetch<PortfolioAssetsReply>(
    `/api/portfolio/wallet/${address}`,
  )
  const { data: portfolioOverviewData } = useFetch<PortfolioOverviewResponse>(
    `${awsInfraUrl}/portfolio-overview?address=${address}`,
    {
      headers: awsInfraHeader,
    },
  )

  return address ? (
    <PortfolioLayout>
      <Box sx={{ width: '100%' }}>
        <PortfolioHeader address={address} />
        <PortfolioOverview overviewData={portfolioOverviewData} />
        <Flex sx={{ flexDirection: 'column' }}>
          <Box>
            <h4>{tPortfolio('positions-data')}</h4>
            <pre>{JSON.stringify(portfolioPositionsData, null, 2)}</pre>
          </Box>
          <Box>
            <h4>{tPortfolio('wallet-data')}</h4>
            <pre>{JSON.stringify(portfolioWalletData, null, 2)}</pre>
          </Box>
        </Flex>
      </Box>
    </PortfolioLayout>
  ) : null
}
