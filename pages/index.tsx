
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { MarketingLayout } from 'components/Layouts'
import { LandingView } from 'features/landing/LandingView'
import React from 'react'

export default function LandingPage() {

  return <WithConnection><LandingView /></WithConnection>
}

LandingPage.layout = MarketingLayout
LandingPage.layoutProps = {
  variant: 'landingContainer',
}
LandingPage.theme = 'Landing'
