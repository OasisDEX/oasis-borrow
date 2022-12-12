import {
  NavigationBranding,
  NavigationBrandingPill,
} from 'components/navigation/NavigationBranding'
import React from 'react'
import { Box, Container } from 'theme-ui'

interface NavigationProps {
  pill?: NavigationBrandingPill
}

export function Navigation({ pill }: NavigationProps) {
  return (
    <Container
      as="header"
      variant="navigation"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '24px' }}
    >
      <NavigationBranding link="/ajna" pill={pill} />
      <Box>Nav</Box>
      <Box>Panels</Box>
    </Container>
  )
}
