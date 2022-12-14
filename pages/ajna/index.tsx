import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AjnaLayout, ajnaPageSeoTags, AjnaWrapper } from 'features/ajna/common/layout'
import React from 'react'
import { Box } from 'theme-ui'

function AjnaLandingPage() {
  return (
    <WithConnection>
      <AjnaWrapper>
        <Box sx={{ width: '100%', height: '500px' }}>Test</Box>
      </AjnaWrapper>
    </WithConnection>
  )
}

AjnaLandingPage.layout = AjnaLayout
AjnaLandingPage.seoTags = ajnaPageSeoTags

export default AjnaLandingPage
