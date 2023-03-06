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
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import React, { ReactNode } from 'react'
import { Box, Container, ThemeProvider } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface NavigationProps {
  actions?: ReactNode
  brandingLink?: string
  links?: NavigationMenuPanelLinkType[]
  panels?: NavigationMenuPanelType[]
  pill?: NavigationBrandingPill
}

export const navigationBreakpoints = ['531px', '744px', '1025px', '1279px']

export function Navigation({
  actions,
  brandingLink = INTERNAL_LINKS.homepage,
  links,
  panels,
  pill,
}: NavigationProps) {
  const [isMobileMenuOpen, toggleIsMobileMenuOpen, setIsMobileMenuOpen] = useToggle(false)
  const ref = useOutsideElementClickHandler(() => setIsMobileMenuOpen(false))
  const isViewBelowL = useMediaQuery(`(max-width: ${navigationBreakpoints[2]})`)

  return (
    <ThemeProvider theme={{ breakpoints: navigationBreakpoints }}>
      <Container
        as="header"
        variant="navigation"
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: '24px',
          mb: '64px',
          zIndex: 3,
        }}
      >
        <NavigationBranding link={brandingLink} pill={pill} />
        {!isViewBelowL && <NavigationMenu links={links} panels={panels} />}
        <NavigationActions>
          {actions}
          {isViewBelowL && (
            <Box ref={ref}>
              <NavigationOrb icon="menu" iconSize={20} onClick={toggleIsMobileMenuOpen} />
              <NavigationMobileMenu
                close={() => {
                  setIsMobileMenuOpen(false)
                }}
                isOpen={isMobileMenuOpen}
                links={links}
                panels={panels}
              />
            </Box>
          )}
        </NavigationActions>
      </Container>
    </ThemeProvider>
  )
}
