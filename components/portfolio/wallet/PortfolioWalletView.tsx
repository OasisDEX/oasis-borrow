import type { NetworkNames } from 'blockchain/networks'
import { GenericMultiselect } from 'components/GenericMultiselect'
import { BlogPosts } from 'components/portfolio/blog-posts/BlogPosts'
import { PortfolioWalletAssets } from 'components/portfolio/wallet/PortfolioWalletAssets'
import { PortfolioWalletBanner } from 'components/portfolio/wallet/PortfolioWalletBanner'
import { PortfolioWalletSummary } from 'components/portfolio/wallet/PortfolioWalletSummary'
import { productHubNetworkFilter } from 'features/productHub/meta'
import type { BlogPostsReply } from 'helpers/types/blog-posts.types'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Grid, Heading } from 'theme-ui'

import type { PortfolioAssetsResponse } from 'lambdas/src/shared/domain-types'

export const PortfolioWalletView = ({
  portfolioWalletData,
  isOwner,
  blogPosts,
}: {
  address: string
  isOwner: boolean
  portfolioWalletData?: PortfolioAssetsResponse
  blogPosts?: BlogPostsReply
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')

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
    <Grid variant="portfolio">
      <Box>
        <Flex sx={{ alignItems: 'flex-end', justifyContent: 'space-between', mb: '24px' }}>
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
            <Flex sx={{ my: '24px' }}>
              <Heading as="h2" variant="header5">
                {tPortfolio('assets')}
              </Heading>
            </Flex>
            <PortfolioWalletAssets assets={filteredAssets} />
          </>
        )}
        {portfolioWalletData?.assets && isOwner && (
          <Box sx={{ mt: '24px' }}>
            <PortfolioWalletBanner assets={portfolioWalletData.assets} />
          </Box>
        )}
      </Box>
      <Box>
        <BlogPosts posts={blogPosts} />
      </Box>
    </Grid>
  )
}
