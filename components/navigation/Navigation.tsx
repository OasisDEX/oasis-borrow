import { NavigationActions } from 'components/navigation/NavigationActions'
import { NavigationBranding } from 'components/navigation/NavigationBranding'
import { NavigationMenu } from 'components/navigation/NavigationMenu'
import { NavigationOrb } from 'components/navigation/NavigationMenuOrb'
import { NavigationMobileMenu } from 'components/navigation/NavigationMobileMenu'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useOutsideElementClickHandler } from 'helpers/useOutsideElementClickHandler'
import { useToggle } from 'helpers/useToggle'
import React from 'react'
import { Box, Container, ThemeUIProvider } from 'theme-ui'
import { menu } from 'theme/icons'
import { useMediaQuery } from 'usehooks-ts'

import { navigationBreakpoints, navigationBreakpointsWithPixels } from './Navigation.constants'
import type { NavigationProps } from './Navigation.types'

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
    <ThemeUIProvider theme={{ breakpoints: navigationBreakpointsWithPixels }}>
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
              <NavigationOrb icon={menu} iconSize={20} onClick={toggleIsMobileMenuOpen} />
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
    </ThemeUIProvider>
  )
}
