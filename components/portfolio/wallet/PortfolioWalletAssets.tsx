import BigNumber from 'bignumber.js'
import { networksByName } from 'blockchain/networks'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { getPortfolioChangeColor, getPortfolioTokenProducts } from 'components/portfolio/helpers'
import type { PortfolioAssetsToken } from 'features/portfolio/types'
import { getTokenGroup } from 'handlers/product-hub/helpers'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { upperFirst } from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Text } from 'theme-ui'

interface PortfolioWalletAssetsProps {
  assets?: PortfolioAssetsToken[]
}

export const PortfolioWalletAssets = ({ assets = [] }: PortfolioWalletAssetsProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const {
    productHub: { table },
  } = usePreloadAppDataContext()

  return (
    <Box sx={{ p: 3, border: '1px solid', borderColor: 'neutral20', borderRadius: 'large' }}>
      <Flex sx={{ mb: '24px' }}>
        <Text variant="paragraph4" sx={{ flexGrow: 1, color: 'neutral80' }}>
          {tPortfolio('token')}
        </Text>
        <Text variant="paragraph4" sx={{ width: '150px', textAlign: 'right', color: 'neutral80' }}>
          {tPortfolio('price-24')}
        </Text>
        <Text variant="paragraph4" sx={{ width: '150px', textAlign: 'right', color: 'neutral80' }}>
          {tPortfolio('balance')}
        </Text>
      </Flex>
      <Flex as="ul" sx={{ flexDirection: 'column', rowGap: 3, m: 0, p: 0, listStyle: 'none' }}>
        {assets.map(({ balance, balanceUSD, network, price24hChange, priceUSD, symbol }) => {
          const products = getPortfolioTokenProducts({ network, table, token: symbol })

          return (
            <Box
              as="li"
              sx={{
                pb: 3,
                borderBottom: '1px solid',
                borderColor: 'neutral20',
                ':last-of-type': {
                  pb: 0,
                  border: 'none',
                },
              }}
            >
              <Flex>
                <Box sx={{ flexGrow: 1 }}>
                  <AssetsTableDataCellAsset
                    asset={symbol}
                    icons={symbol === 'WETH' ? ['ETH'] : [symbol]}
                    description={
                      <Text
                        sx={{
                          ...(networksByName[network].gradient && {
                            fontWeight: 'semiBold',
                            background: networksByName[network].gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }),
                        }}
                      >
                        {upperFirst(network)}
                      </Text>
                    }
                  />
                </Box>
                <Flex sx={{ flexDirection: 'column', width: '150px', textAlign: 'right' }}>
                  <Text variant="paragraph3" sx={{ my: 1 }}>
                    ${formatCryptoBalance(new BigNumber(priceUSD))}
                  </Text>
                  <Text
                    variant="paragraph4"
                    sx={{ color: getPortfolioChangeColor(price24hChange) }}
                  >
                    {price24hChange.toFixed(2)}%
                  </Text>
                </Flex>
                <Flex sx={{ flexDirection: 'column', width: '150px', textAlign: 'right' }}>
                  <Text variant="paragraph3" sx={{ my: 1 }}>
                    {formatCryptoBalance(new BigNumber(balance))} {symbol}
                  </Text>
                  <Text variant="paragraph4">
                    ${formatCryptoBalance(new BigNumber(balanceUSD))}
                  </Text>
                </Flex>
              </Flex>
              <Flex sx={{ flexDirection: 'column' }}>
                {products.map((product) => (
                  <span>
                    /{product}/{getTokenGroup(symbol)}?network={network}
                  </span>
                ))}
              </Flex>
            </Box>
          )
        })}
      </Flex>
    </Box>
  )
}
