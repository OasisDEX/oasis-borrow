import { Heading } from '@theme-ui/components'
import { PriceInfo } from 'features/shared/priceInfo'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React, { ReactNode } from 'react'
import { Box, Grid } from 'theme-ui'

import { VaultHeadline } from './VaultHeadline'

export function VaultHeaderContainer({
  children,
  header,
  token,
  priceInfo,
}: {
  children: ReactNode
  header: string
  token: string
  priceInfo: PriceInfo
}) {
  const newComponentsEnabled = useFeatureToggle('NewComponents')

  return (
    <Grid mt={4}>
      {newComponentsEnabled ? (
        <VaultHeadline header={header} token={token} priceInfo={priceInfo} />
      ) : (
        <>
          <Heading
            as="h1"
            variant="heading1"
            sx={{
              fontWeight: 'semiBold',
              pb: 2,
            }}
          >
            {header}
          </Heading>
          <Box
            sx={{
              mb: 4,
              fontSize: 1,
              fontWeight: 'semiBold',
              color: 'text.subtitle',
              display: ['grid', 'flex'],
              gridTemplateColumns: '1fr 1fr',
              gap: [3, 0],
            }}
          >
            {children}
          </Box>
        </>
      )}
    </Grid>
  )
}
