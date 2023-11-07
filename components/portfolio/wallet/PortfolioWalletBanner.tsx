import BigNumber from 'bignumber.js'
import { usePortfolioMatchingAssets } from 'components/portfolio/helpers/usePortfolioMatchingAssets'
import { TokenBanner } from 'components/TokenBanner'
import { formatAmount } from 'helpers/formatters/format'
import { getGradientColor, summerBrandGradient } from 'helpers/getGradientColor'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'

import type { PortfolioAsset } from 'lambdas/src/shared/domain-types'

interface PortfolioWalletBannerProps {
  assets: PortfolioAsset[]
}

export const PortfolioWalletBanner = ({ assets }: PortfolioWalletBannerProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const { matchingAssetsValue, matchingTopAssets } = usePortfolioMatchingAssets({ assets })

  return matchingAssetsValue ? (
    <TokenBanner cta={tPortfolio('explore')} tokens={matchingTopAssets} url="/earn">
      <Trans
        t={tPortfolio}
        i18nKey="explore-banner"
        components={{
          span: <Text sx={getGradientColor(summerBrandGradient)} />,
        }}
        values={{ amount: formatAmount(new BigNumber(matchingAssetsValue), 'USD') }}
      />
    </TokenBanner>
  ) : null
}
