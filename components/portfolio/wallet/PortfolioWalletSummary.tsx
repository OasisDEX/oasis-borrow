import BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { getPortfolioChangeColor, getPortfolioChangeSign } from 'components/portfolio/helpers'
import { PortfolioWalletTopAssets } from 'components/portfolio/wallet/PortfolioWalletTopAssets'
import { Skeleton } from 'components/Skeleton'
import { formatAmount } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Text } from 'theme-ui'

interface PortfolioWalletSummaryProps {
  totalAssets?: number
  totalAssetsChange?: number
}

export const PortfolioWalletSummary = ({
  totalAssets,
  totalAssetsChange,
}: PortfolioWalletSummaryProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const topAssets = [
    {
      asset: 'ETH',
      network: 'optimism' as NetworkNames,
      value: 7361287,
    },
    {
      asset: 'USDC',
      network: 'ethereum' as NetworkNames,
      value: 5312498,
    },
    {
      asset: 'DAI',
      network: 'ethereum' as NetworkNames,
      value: 1378423,
    },
  ]

  return (
    <Box sx={{ p: 3, border: '1px solid', borderColor: 'neutral20', borderRadius: 'large' }}>
      <Text as="p" variant="paragraph4" sx={{ color: 'neutral80' }}>
        {tPortfolio('total-assets')}
      </Text>
      {totalAssets ? (
        <Text as="p" variant="header4">
          ${formatAmount(new BigNumber(totalAssets), 'USD')}
        </Text>
      ) : (
        <Skeleton sx={{ width: '250px', height: 4, mt: 2 }} />
      )}
      {totalAssetsChange ? (
        <Text
          as="p"
          variant="paragraph4"
          sx={{ color: getPortfolioChangeColor(totalAssetsChange) }}
        >
          {getPortfolioChangeSign(totalAssetsChange)}
          {tPortfolio('past-week', { percentage: totalAssetsChange.toFixed(2) })}
        </Text>
      ) : (
        <Skeleton sx={{ width: '250px', height: 3, mt: 1 }} />
      )}
      {topAssets.length > 0 && (
        <>
          <Text as="p" variant="paragraph4" sx={{ mt: '24px', mb: 2, color: 'neutral80' }}>
            {tPortfolio('top-assets', { amount: topAssets.length > 1 ? topAssets.length : '' })}
          </Text>
          <PortfolioWalletTopAssets assets={topAssets} />
        </>
      )}
    </Box>
  )
}
