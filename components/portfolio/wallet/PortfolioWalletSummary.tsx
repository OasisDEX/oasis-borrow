import BigNumber from 'bignumber.js'
import { getPortfolioChangeColor, getPortfolioChangeSign } from 'components/portfolio/helpers'
import { PortfolioWalletTopAssets } from 'components/portfolio/wallet/PortfolioWalletTopAssets'
import { Skeleton } from 'components/Skeleton'
import type { PortfolioAssetsToken } from 'features/portfolio/types'
import { formatAmount } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Text } from 'theme-ui'

interface PortfolioWalletSummaryProps {
  assets?: PortfolioAssetsToken[]
  totalAssets?: number
  totalAssetsChange?: number
}

export const PortfolioWalletSummary = ({
  assets,
  totalAssets,
  totalAssetsChange,
}: PortfolioWalletSummaryProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  return (
    <Box sx={{ p: 3, border: '1px solid', borderColor: 'neutral20', borderRadius: 'large' }}>
      <Text as="p" variant="paragraph4" sx={{ color: 'neutral80' }}>
        {tPortfolio('total-assets')}
      </Text>
      {totalAssets !== undefined ? (
        <Text as="p" variant="header4">
          ${formatAmount(new BigNumber(totalAssets), 'USD')}
        </Text>
      ) : (
        <Skeleton sx={{ width: '250px', height: 4, mt: 2 }} />
      )}
      {totalAssetsChange !== undefined ? (
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
      <Text as="p" variant="paragraph4" sx={{ mt: '24px', mb: 2, color: 'neutral80' }}>
        {tPortfolio('top-assets', { amount: assets?.length ?? 0 > 1 ? assets?.length : '' })}
      </Text>
      <PortfolioWalletTopAssets assets={assets} />
    </Box>
  )
}
