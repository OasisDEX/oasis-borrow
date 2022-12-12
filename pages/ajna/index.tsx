import { AjnaLayout, ajnaPageSeoTags, AjnaWrapper } from 'features/ajna/common/layout'
import React from 'react'
import { Box, Text } from 'theme-ui'

function AjnaLandingPage() {
  return (
    <AjnaWrapper>
      <Box sx={{ width: '100%' }}>
        <Text sx={{ backgroundColor: 'interactive100' }}>
          Text component with background set to interactive100
        </Text>
        <Text sx={{ backgroundColor: 'interactive50' }}>
          Text component with background set to interactive50
        </Text>
      </Box>
    </AjnaWrapper>
  )
}

AjnaLandingPage.layout = AjnaLayout
AjnaLandingPage.seoTags = ajnaPageSeoTags

export default AjnaLandingPage
