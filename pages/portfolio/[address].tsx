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
import React, { useEffect, useState } from 'react'
import { Box } from 'theme-ui'

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
  const [overviewData, setOverviewData] = useState<{
    walletBalanceUsdValue: number
    suppliedUsdValue: number
    suppliedPercentageChange: number
    borrowedUsdValue: number
    borrowedPercentageChange: number
  }>()
  useEffect(() => {
    const test = setTimeout(() => {
      !overviewData &&
        setOverviewData({
          walletBalanceUsdValue: 20859930.02,
          suppliedUsdValue: 1200621,
          suppliedPercentageChange: 10.85,
          borrowedUsdValue: 10000.22,
          borrowedPercentageChange: 0.98,
        })
    }, 1500)
    return () => clearTimeout(test)
  }, [overviewData])
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
