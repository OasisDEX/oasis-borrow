import {
  NavigationBranding,
  NavigationBrandingPill,
} from 'components/navigation/NavigationBranding'
import { NavigationMenu } from 'components/navigation/NavigationMenu'
import { NavigationMenuPanelLinkType } from 'components/navigation/NavigationMenuLink'
import { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import React from 'react'
import { Box, Container } from 'theme-ui'

interface NavigationProps {
  brandingLink?: string
  links?: NavigationMenuPanelLinkType[]
  panels?: NavigationMenuPanelType[]
  pill?: NavigationBrandingPill
}

export function Navigation({ brandingLink = '/', links, panels, pill }: NavigationProps) {
  return (
    <Container
      as="header"
      variant="navigation"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mt: 3,
      }}
    >
      <NavigationBranding link={brandingLink} pill={pill} />
      <NavigationMenu links={links} panels={panels} />
      <Box>Panels</Box>
    </Container>
  )
}
