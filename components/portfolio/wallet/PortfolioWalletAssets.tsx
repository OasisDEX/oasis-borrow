import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import type { PortfolioAssetsToken } from 'features/portfolio/types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex } from 'theme-ui'

interface PortfolioWalletAssetsProps {
  assets?: PortfolioAssetsToken[]
}

export const PortfolioWalletAssets = ({ assets = [] }: PortfolioWalletAssetsProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  return (
    <Box sx={{ border: '1px solid', borderColor: 'neutral20', borderRadius: 'large' }}>
      <Flex as="ul" sx={{ flexDirection: 'column', rowGap: 2, m: 0, p: 3, listStyle: 'none' }}>
        {assets.map(({ balanceUSD, network, symbol }) => (
          <Box as="li">
            <Flex>
              <AssetsTableDataCellAsset asset={symbol} icons={[symbol]} />
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}
