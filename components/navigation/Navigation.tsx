import { NavigationActions } from 'components/navigation/NavigationActions'
import {
  NavigationBranding,
  NavigationBrandingPill,
} from 'components/navigation/NavigationBranding'
import { NavigationMenu } from 'components/navigation/NavigationMenu'
import { NavigationMenuPanelLinkType } from 'components/navigation/NavigationMenuLink'
import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import { NavigationMobileMenu } from 'components/navigation/NavigationMobileMenu'
import { useToggle } from 'helpers/useToggle'
import React, { ReactNode } from 'react'
import { Container, ThemeProvider } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface NavigationProps {
  actions?: ReactNode
  brandingLink?: string
  links?: NavigationMenuPanelLinkType[]
  panels?: NavigationMenuPanelType[]
  pill?: NavigationBrandingPill
}

export const navigationBreakpoints = ['531px', '744px', '1025px', '1279px']

export function Navigation({ actions, brandingLink = '/', links, panels, pill }: NavigationProps) {
  const [isMobileMenuOpen, toggleIsMobileMenuOpen] = useToggle(false)
  const isViewNotL = useMediaQuery(`(max-width: ${navigationBreakpoints[2]})`)

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
        }}
      >
        <NavigationBranding link={brandingLink} pill={pill} />
        {!isViewNotL && <NavigationMenu links={links} panels={panels} />}
        <NavigationActions>
          {actions}
          {isViewNotL && (
            <NavigationOrb icon="menu" iconSize={20} onClick={toggleIsMobileMenuOpen} />
          )}
        </NavigationActions>
        {isViewNotL && <NavigationMobileMenu isOpen={isMobileMenuOpen} links={links} panels={panels} />}
      </Container>
    </ThemeProvider>
  )
}
