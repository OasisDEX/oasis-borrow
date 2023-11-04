import BigNumber from 'bignumber.js'
import { Skeleton } from 'components/Skeleton'
import { TokensGroup } from 'components/TokensGroup'
import { formatFiatBalance } from 'helpers/formatters/format'
import React from 'react'
import { Flex, Grid, Text } from 'theme-ui'

import type { PortfolioAsset } from 'lambdas/src/shared/domain-types'

interface PortfolioWalletTopAssetsProps {
  assets?: PortfolioAsset[]
}

export const PortfolioWalletTopAssets = ({ assets }: PortfolioWalletTopAssetsProps) => {
  return (
    <>
      {assets ? (
        <Grid
          as="ul"
          sx={{
            gridTemplateColumns: ['1fr', '1fr 1fr 1fr'],
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
