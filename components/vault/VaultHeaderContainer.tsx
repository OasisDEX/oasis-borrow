import type { PriceInfo } from 'features/shared/priceInfo.types'
import type { ReactNode } from 'react'
import React from 'react'
import { Box, Grid } from 'theme-ui'

import { DefaultVaultHeadline } from './DefaultVaultHeadline'

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
  return (
    <Grid mt={4} sx={{ zIndex: 2 }}>
      <DefaultVaultHeadline header={header} token={[token]} priceInfo={priceInfo} />
      <Box
        sx={{
          mt: '-10px',
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
    </Grid>
  )
}
