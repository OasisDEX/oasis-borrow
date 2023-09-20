import { AssetsFiltersContainer } from 'components/assetsTable/AssetsFiltersContainer'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { PromoCardLoadingState } from 'components/PromoCard'
import { Skeleton } from 'components/Skeleton'
import type { FC } from 'react'
import React from 'react'
import { Box, Grid } from 'theme-ui'

export const ProductHubLoadingState: FC = () => {
  return (
    <>
      <Grid columns={[1, null, 2, 3]} gap={3} sx={{ mb: 4 }}>
        <PromoCardLoadingState />
        <PromoCardLoadingState />
        <PromoCardLoadingState />
      </Grid>
      <AssetsTableContainer>
        <AssetsFiltersContainer
          gridTemplateColumns={['100%', null, 'repeat(3, 1fr)', '270px auto 220px 220px']}
        >
          <Skeleton height="56px" />
          <Box />
          <Skeleton height="56px" />
          <Skeleton height="56px" />
        </AssetsFiltersContainer>
        <Box sx={{ m: 4 }}>
          <Skeleton count={5} gap={4} />
        </Box>
      </AssetsTableContainer>
    </>
  )
}
