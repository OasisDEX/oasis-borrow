import { AjnaLayout, ajnaPageSeoTags, AjnaWrapper } from 'features/ajna/common/layout'
import React from 'react'
import { Box } from 'theme-ui'

function AjnaLandingPage() {
  return (
    <AjnaWrapper>
      <Box sx={{ width: '100%', height: '500px' }} />
    </AjnaWrapper>
  )
}

AjnaLandingPage.layout = AjnaLayout
AjnaLandingPage.seoTags = ajnaPageSeoTags

export default AjnaLandingPage
