import { Skeleton } from 'components/Skeleton'
import type { FC } from 'react'
import React from 'react'
import { Flex } from 'theme-ui'

export const Erc4626DetailsSectionContentEstimationLoader: FC = () => {
  return (
    <Flex sx={{ justifyContent: 'flex-end' }}>
      <Skeleton width="100px" sx={{ mt: '3px' }} />
    </Flex>
  )
}
