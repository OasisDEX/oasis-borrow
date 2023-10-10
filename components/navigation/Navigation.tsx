import { NavigationActions } from 'components/navigation/NavigationActions'
import type { NavigationBrandingPill } from 'components/navigation/NavigationBranding'
import { NavigationBranding } from 'components/navigation/NavigationBranding'
import { NavigationMenu } from 'components/navigation/NavigationMenu'
import type { NavigationMenuPanelLinkType } from 'components/navigation/NavigationMenuLink'
import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import type { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import { NavigationMobileMenu } from 'components/navigation/NavigationMobileMenu'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import type { ReactNode } from 'react'
import React from 'react'
import { Box, Container, ThemeProvider } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface NavigationProps {
  actions?: ReactNode
  brandingLink?: string
  links?: NavigationMenuPanelLinkType[]
  panels?: NavigationMenuPanelType[]
  pill?: NavigationBrandingPill
}

export const navigationBreakpoints = [531, 744, 1025, 1279]
export const navigationBreakpointsWithPixels = navigationBreakpoints.map(
  (breakpoint) => `${breakpoint}px`,
)

export function Navigation({
  actions,
  brandingLink = INTERNAL_LINKS.homepage,
  links,
  panels,
  pill,
}: NavigationProps) {
  const [isMobileMenuOpen, toggleIsMobileMenuOpen, setIsMobileMenuOpen] = useToggle(false)
  const ref = useOutsideElementClickHandler(() => setIsMobileMenuOpen(false))
  const isViewBelowL = useMediaQuery(`(max-width: ${navigationBreakpoints[2] - 1}px)`)

  return (
    <ThemeProvider theme={{ breakpoints: navigationBreakpointsWithPixels }}>
      <Container
        as="header"
        variant="navigation"
        sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: ['auto auto', null, null, 'auto auto auto', '1fr auto 1fr'],
          alignItems: 'center',
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
