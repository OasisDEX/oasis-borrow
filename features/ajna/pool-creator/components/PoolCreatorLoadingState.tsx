import { DetailsSection, DetailsSectionTitle } from 'components/DetailsSection'
import { Skeleton } from 'components/Skeleton'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

function InputLoadingState() {
  return (
    <Flex sx={{ gap: '12px', flexDirection: 'column', '&:first-of-type': { mb: 3 } }}>
      <Skeleton width="30%" />
      <Skeleton height="48px" />
    </Flex>
  )
}

export function PoolCreatorLoadingState() {
  return (
    <DetailsSection
      title={
        <DetailsSectionTitle loose={true}>
          <Skeleton width="240px" height="28px" />
        </DetailsSectionTitle>
      }
      loose
      content={
        <Grid gap={'24px'}>
          <InputLoadingState />
          <InputLoadingState />
        </Grid>
      }
    />
  )
}
