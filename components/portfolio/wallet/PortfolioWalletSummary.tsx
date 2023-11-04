import BigNumber from 'bignumber.js'
import { getPortfolioChangeColor, getPortfolioChangeSign } from 'components/portfolio/helpers'
import { PortfolioWalletTopAssets } from 'components/portfolio/wallet/PortfolioWalletTopAssets'
import { Skeleton } from 'components/Skeleton'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Text } from 'theme-ui'

import type { PortfolioAsset } from 'lambdas/src/shared/domain-types'

interface PortfolioWalletSummaryProps {
  assets?: PortfolioAsset[]
}

export const PortfolioWalletSummary = ({ assets }: PortfolioWalletSummaryProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const topAssets = useMemo(() => (assets ? assets.slice(0, 3) : undefined), [assets])
  const totalAssetsAmount = useMemo(
    () => (assets ? assets.reduce((acc, token) => acc + token.balanceUSD, 0) : undefined),
    [assets],
  )
  const totalAssetsAmountChange = useMemo(
    () =>
      assets
        ? assets.length
          ? assets
              .filter((token) => token.price24hChange != null)
              .reduce((acc, token) => acc + (token.price24hChange ?? 0), 0) / assets.length
          : 0
        : undefined,
    [assets],
  )

  return (
    <Box sx={{ p: 3, border: '1px solid', borderColor: 'neutral20', borderRadius: 'large' }}>
      <Text as="p" variant="paragraph4" sx={{ color: 'neutral80' }}>
        {tPortfolio('total-assets')}
      </Text>
      {totalAssetsAmount !== undefined ? (
        <Text as="p" variant="header4">
          ${formatAmount(new BigNumber(totalAssetsAmount), 'USD')}
        </Text>
      ) : (
        <Skeleton sx={{ width: '250px', height: 4, mt: 2 }} />
      )}
      {totalAssetsAmountChange !== undefined ? (
        <Text
          as="p"
          variant="paragraph4"
          sx={{ color: getPortfolioChangeColor(totalAssetsAmountChange) }}
        >
          {getPortfolioChangeSign(totalAssetsAmountChange)}
          {tPortfolio('past-week', {
            percentage: formatCryptoBalance(new BigNumber(totalAssetsAmountChange * 100)),
          })}
        </Text>
      ) : (
        <Skeleton sx={{ width: '250px', height: 3, mt: 1 }} />
      )}
      <Text as="p" variant="paragraph4" sx={{ mt: '24px', mb: 2, color: 'neutral80' }}>
        {tPortfolio(topAssets === undefined || topAssets?.length > 0 ? 'top-assets' : 'no-assets', {
          amount: (topAssets?.length ?? 0) > 1 ? topAssets?.length : '',
        })}
      </Text>
      <PortfolioWalletTopAssets assets={topAssets} />
    </Box>
  )
}
