import React from 'react'
import { Box } from 'theme-ui'

import { ProductCardData } from '../helpers/productCards'
import { AppLink } from './Links'
import { WithArrow } from './WithArrow'

export function ProductCardProtocolLink({ ilk }: Partial<ProductCardData>) {
  return (
    <Box sx={{ paddingRight: '10px' }}>
      <AppLink href={`https://makerburn.com/#/collateral/${ilk}`}>
        <WithArrow variant="styles.a" gap="1">
          {ilk}
        </WithArrow>
      </AppLink>
    </Box>
  )
}
