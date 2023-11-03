import { GenericMultiselect } from 'components/GenericMultiselect'
import { PortfolioWalletSummary } from 'components/portfolio/wallet/PortfolioWalletSummary'
import type { PortfolioAssetsReply } from 'features/portfolio/types'
import { productHubNetworkFilter } from 'features/productHub/meta'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Grid, Heading } from 'theme-ui'
import { useFetch } from 'usehooks-ts'

export const WalletView = ({ address }: { address: string }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  const { data: portfolioWalletData } = useFetch<PortfolioAssetsReply>(
    `/api/portfolio/wallet/${address}`,
  )

  return (
    <Grid variant="vaultContainer">
      <Box>
        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mb: '24px' }}>
          <Heading as="h2" variant="header5">
            {tPortfolio('summary')}
          </Heading>
          <GenericMultiselect
            sx={{ width: '220px' }}
            label={tPortfolio('networks')}
            options={productHubNetworkFilter}
            onChange={(value) => {
              console.info(value)
            }}
          />
        </Flex>
        <PortfolioWalletSummary
          totalAssets={portfolioWalletData?.totalUSDAssets}
          totalAssetsChange={portfolioWalletData?.totalUSDAssets24hChange}
        />
        <Heading as="h2" variant="header5">
          {tPortfolio('assets')}
        </Heading>
      </Box>
      <Box>
        <pre>{JSON.stringify(portfolioWalletData, null, 2)}</pre>
      </Box>
    </Grid>
  )
}
