import BigNumber from 'bignumber.js'
import { Skeleton } from 'components/Skeleton'
import { TokensGroup } from 'components/TokensGroup'
import type { PortfolioAssetsToken } from 'features/portfolio/types'
import { formatFiatBalance } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Grid, Text } from 'theme-ui'

interface PortfolioWalletTopAssetsProps {
  assets?: PortfolioAssetsToken[]
}

export const PortfolioWalletTopAssets = ({ assets }: PortfolioWalletTopAssetsProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  return (
    <>
      {assets ? (
        <>
          {assets.length > 0 ? (
            <Grid
              as="ul"
              sx={{
                gridTemplateColumns: '1fr 1fr 1fr',
                columnGap: 2,
                m: 0,
                p: 0,
                listStyle: 'none',
              }}
            >
              {assets.map(({ balanceUSD, network, symbol }) => (
                <Flex
                  key={`${network}-${symbol}`}
                  as="li"
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'neutral20',
                    borderRadius: 'medium',
                  }}
                >
                  <TokensGroup tokens={[symbol]} forceSize={40} network={network} />
                  <Flex sx={{ flexDirection: 'column', pl: 2 }}>
                    <Text as="span" variant="paragraph4" sx={{ color: 'neutral80' }}>
                      {symbol}
                    </Text>
                    <Text as="span" variant="boldParagraph3">
                      ${formatFiatBalance(new BigNumber(balanceUSD))}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Grid>
          ) : (
            <Text as="p" variant="boldParagraph3">
              {tPortfolio('no-assets')}
            </Text>
          )}
        </>
      ) : (
        <Grid
          sx={{
            gridTemplateColumns: '1fr 1fr 1fr',
            columnGap: 2,
            m: 0,
            p: 0,
            listStyle: 'none',
          }}
        >
          <Skeleton sx={{ height: '60px' }} />
          <Skeleton sx={{ height: '60px' }} />
          <Skeleton sx={{ height: '60px' }} />
        </Grid>
      )}
    </>
  )
}
