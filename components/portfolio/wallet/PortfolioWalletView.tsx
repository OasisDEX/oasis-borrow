import type { NetworkNames } from 'blockchain/networks'
import { GenericMultiselect } from 'components/GenericMultiselect'
import { PortfolioWalletAssets } from 'components/portfolio/wallet/PortfolioWalletAssets'
import { PortfolioWalletSummary } from 'components/portfolio/wallet/PortfolioWalletSummary'
import { productHubNetworkFilter } from 'features/productHub/meta'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Grid, Heading } from 'theme-ui'

import type { PortfolioAssetsResponse } from 'lambdas/src/portfolio-assets/types'

export const PortfolioWalletView = ({
  address,
  fetchData,
}: {
  address: string
  fetchData: (address: string) => Promise<PortfolioAssetsResponse>
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  const [portfolioWalletData, setPortfolioWalletData] = useState<PortfolioAssetsResponse>()

  useEffect(() => {
    void fetchData(address).then((data) => {
      setPortfolioWalletData(data)
    })
  }, [address, fetchData])

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkNames[]>([])
  const filteredAssets = useMemo(
    () =>
      portfolioWalletData?.assets
        ? portfolioWalletData.assets.filter(
            ({ network }) => selectedNetwork.includes(network) || selectedNetwork.length === 0,
          )
        : undefined,
    [portfolioWalletData?.assets, selectedNetwork],
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
              setSelectedNetwork(value as NetworkNames[])
            }}
          />
        </Flex>
        <PortfolioWalletSummary assets={filteredAssets} />
        {(filteredAssets?.length ?? 0) > 0 && (
          <>
            <Heading as="h2" variant="header5" sx={{ my: '24px' }}>
              {tPortfolio('assets')}
            </Heading>
            <PortfolioWalletAssets assets={filteredAssets} />
          </>
        )}
      </Box>
      <Box></Box>
    </Grid>
  )
}
