import { NavigationActions } from 'components/navigation/NavigationActions'
import {
  NavigationBranding,
  NavigationBrandingPill,
} from 'components/navigation/NavigationBranding'
import { NavigationMenu } from 'components/navigation/NavigationMenu'
import { NavigationMenuPanelLinkType } from 'components/navigation/NavigationMenuLink'
import { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import React, { ReactNode } from 'react'
import { Container, ThemeProvider } from 'theme-ui'

interface NavigationProps {
  actions?: ReactNode
  brandingLink?: string
  links?: NavigationMenuPanelLinkType[]
  panels?: NavigationMenuPanelType[]
  pill?: NavigationBrandingPill
}

export const navigationBreakpoints = ['431px', '744px', '1025px', '1279px']

export function Navigation({ actions, brandingLink = '/', links, panels, pill }: NavigationProps) {
  return (
    <ThemeProvider theme={{ breakpoints: navigationBreakpoints }}>
      <Container
        as="header"
        variant="navigation"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: '24px',
          zIndex: 3,
          // bg: ['green', 'blue', 'yellow', 'red', 'pink'],
        }}
      >
        <NavigationBranding link={brandingLink} pill={pill} />
        <NavigationMenu links={links} panels={panels} />
        <NavigationActions>{actions}</NavigationActions>
      </Container>
    </ThemeProvider>
  )
}
