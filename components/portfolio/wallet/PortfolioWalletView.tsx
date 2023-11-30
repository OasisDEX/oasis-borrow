import type { NetworkNames } from 'blockchain/networks'
import { EmptyState } from 'components/EmptyState'
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

import type { PortfolioAssetsResponse } from 'lambdas/lib/shared/src/domain-types'

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
      <Flex sx={{ flexDirection: 'column', rowGap: '24px' }}>
        <Flex sx={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
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
        <Heading as="h2" variant="header5">
          {tPortfolio('assets')}
        </Heading>
        {(filteredAssets?.length ?? 0) > 0 ? (
          <PortfolioWalletAssets assets={filteredAssets} />
        ) : (
          <EmptyState header={tPortfolio('empty-states.no-assets')} />
        )}
        {portfolioWalletData?.assets && isOwner && (
          <PortfolioWalletBanner assets={portfolioWalletData.assets} />
        )}
      </Flex>
      <Box>
        <BlogPosts posts={blogPosts?.news} />
      </Box>
    </Grid>
  )
}
