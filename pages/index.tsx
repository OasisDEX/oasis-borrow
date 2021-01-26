import { AppLayout } from 'components/Layouts'
import { LandingView } from 'features/landing/LandingView'
import React from 'react'

export default function LandingPage() {
  return <LandingView />
}

LandingPage.layout = AppLayout
LandingPage.layoutProps = {
  variant: 'landingContainer',
}
LandingPage.theme = 'Landing'
