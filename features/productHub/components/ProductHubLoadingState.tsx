import { AssetsFiltersContainer } from 'components/assetsTable/AssetsFiltersContainer'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { Skeleton } from 'components/Skeleton'
import React, { type FC } from 'react'
import { Box } from 'theme-ui'

export const ProductHubLoadingState: FC = () => {
  return (
    <>
      <AssetsTableContainer>
        <AssetsFiltersContainer
          filters={[
            {
              id: 'skeleton1',
              component: <Skeleton height="56px" />,
            },
            {
              id: 'skeleton2',
              component: <Skeleton height="56px" />,
            },
            {
              id: 'skeleton3',
              component: <Skeleton height="56px" />,
            },
            {
              id: 'skeleton4',
              component: <Skeleton height="56px" />,
            },
          ]}
        />
        <Box sx={{ m: 4 }}>
          <Skeleton count={5} gap={4} />
        </Box>
      </AssetsTableContainer>
    </>
  )
}
