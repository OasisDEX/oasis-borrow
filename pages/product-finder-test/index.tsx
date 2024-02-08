import { AppLayout } from 'components/layouts/AppLayout'
import { ProductHubProductType } from 'features/productHub/types'
import { ProductHubView } from 'features/productHub/views'
import React from 'react'
import { Box } from 'theme-ui'

function ProductFinderTestPage() {
  return (
    <AppLayout>
      <Box sx={{ width: '100%' }}>
        <ProductHubView
          product={ProductHubProductType.Borrow}
          promoCardsCollection="Home"
          perPage={15}
          hiddenNLS
          promoCardsPosition="none"
        />
      </Box>
    </AppLayout>
  )
}

export default ProductFinderTestPage
