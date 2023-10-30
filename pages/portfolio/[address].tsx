import { AppLayout } from 'components/layouts/AppLayout'
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
  const { data: portfolioData } = useFetch<PortfolioAssetsReply>(`/api/portfolio/wallet/${address}`)
  return address ? (
    <AppLayout>
      <Flex sx={{ flexDirection: 'column' }}>
        <Box>
          <h3>{tPortfolio('portfolio-view', { address })}</h3>
        </Box>
        <Box>
          <pre>{JSON.stringify(portfolioData, null, 2)}</pre>
        </Box>
      </Flex>
    </AppLayout>
  ) : null
}
