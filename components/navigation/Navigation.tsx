import {
  NavigationBranding,
  NavigationBrandingPill,
} from 'components/navigation/NavigationBranding'
import { NavigationMenu, NavigationMenuLink } from 'components/navigation/NavigationMenu'
import React from 'react'
import { Box, Container } from 'theme-ui'

interface NavigationProps {
  brandingLink?: string
  links: NavigationMenuLink[]
  pill?: NavigationBrandingPill
}

export function Navigation({ brandingLink = '/', links, pill }: NavigationProps) {
  return (
    <Container
      as="header"
      variant="navigation"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '24px' }}
    >
      <NavigationBranding link={brandingLink} pill={pill} />
      <NavigationMenu links={links} />
      <Box>Panels</Box>
    </Container>
  )
}
