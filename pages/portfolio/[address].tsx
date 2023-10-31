import { PortfolioLayout } from 'components/layouts/PortfolioLayout'
import { PortfolioHeader } from 'components/portfolio/PortfolioHeader'
import type { PortfolioAssetsReply } from 'features/portfolio/types'
import { useRedirect } from 'helpers/useRedirect'
import type { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useEffect } from 'react'
import { Box, Flex } from 'theme-ui'
import { useFetch } from 'usehooks-ts'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale ?? 'en', ['portfolio', 'common'])),
      address: ctx.query?.address ?? null,
    },
  }
}

export default function PortfolioView({ address }: { address: string }) {
  const { t: tPortfolio } = useTranslation('portfolio')
  const { replace } = useRedirect()
  useEffect(() => {
    if (!address) {
      replace('/')
    }
  }, [address, replace])
  const { data: portfolioPositionsData } = useFetch<PortfolioAssetsReply>(
    `/api/portfolio/positions/${address}`,
  )
  const { data: portfolioWalletData } = useFetch<PortfolioAssetsReply>(
    `/api/portfolio/wallet/${address}`,
  )
  return address ? (
    <PortfolioLayout>
      <Box sx={{ width: '100%' }}>
        <PortfolioHeader address={address} />
        <Flex sx={{ flexDirection: 'column' }}>
          <Box>
            <h3>{tPortfolio('portfolio-view', { address })}</h3>
          </Box>
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
