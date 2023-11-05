import BigNumber from 'bignumber.js'
import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { getPortfolioTokenProducts } from 'components/portfolio/helpers'
import { TokenBanner } from 'components/TokenBanner'
import { formatAmount } from 'helpers/formatters/format'
import { uniq } from 'lodash'
import React, { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'

import type { PortfolioAsset } from 'lambdas/src/shared/domain-types'

interface PortfolioWalletBannerProps {
  assets: PortfolioAsset[]
}

export const PortfolioWalletBanner = ({ assets }: PortfolioWalletBannerProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const {
    productHub: { table },
  } = usePreloadAppDataContext()

  const matchingAssets = useMemo(
    () =>
      assets.filter(
        ({ network, symbol }) =>
          getPortfolioTokenProducts({ network, table, token: symbol }).length,
      ),
    [assets, table],
  )
  const matchingTopAssets = useMemo(
    () => uniq(matchingAssets.map(({ symbol }) => symbol)).slice(0, 3),
    [matchingAssets],
  )
  const matchingAssetsValue = useMemo(
    () => matchingAssets.reduce((acc, token) => acc + token.balanceUSD, 0),
    [matchingAssets],
  )

  return (
    <TokenBanner cta={tPortfolio('explore')} tokens={matchingTopAssets} url="/earn">
      <Trans
        t={tPortfolio}
        i18nKey="explore-banner"
        components={{
          span: (
            <Text
              sx={{
                background:
                  'linear-gradient(270deg, #E97047 0.02%, #E7A77F 46.92%, #007DA3 88.44%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            />
          ),
        }}
        values={{ amount: formatAmount(new BigNumber(matchingAssetsValue), 'USD') }}
      />
    </TokenBanner>
  )
}
