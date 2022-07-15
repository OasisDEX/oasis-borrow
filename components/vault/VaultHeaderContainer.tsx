import { Heading } from '@theme-ui/components'
import { PriceInfo } from 'features/shared/priceInfo'
import React, { ReactNode } from 'react'
import { Box, Grid } from 'theme-ui'

export function VaultHeaderContainer({
  children,
  header,
}: {
  children: ReactNode
  header: string
  token: string
  priceInfo: PriceInfo
}) {
  return (
    <Grid mt={4}>
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
            color: 'neutral80',
            display: ['grid', 'flex'],
            gridTemplateColumns: '1fr 1fr',
            gap: [3, 0],
          }}
        >
          {children}
        </Box>
      </>
    </Grid>
  )
}
