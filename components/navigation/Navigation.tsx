import { useAppContext } from 'components/AppContextProvider'
import {
  NavigationBranding,
  NavigationBrandingPill,
} from 'components/navigation/NavigationBranding'
import { NavigationMenu, NavigationMenuLink } from 'components/navigation/NavigationMenu'
import { useObservable } from 'helpers/observableHook'
import React from 'react'
import { Box, Container } from 'theme-ui'

interface NavigationProps {
  brandingLink?: string
  links: NavigationMenuLink[]
  pill?: NavigationBrandingPill
}

export function Navigation({ brandingLink = '/', links, pill }: NavigationProps) {
  const { context$ } = useAppContext()
  const [context] = useObservable(context$)

  const isConnected = context?.status === 'connected'

  return (
    <Container
      as="header"
      variant="navigation"
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '24px' }}
    >
      <NavigationBranding link={brandingLink} pill={pill} />
      <NavigationMenu isConnected={isConnected} links={links} />
      <Box>Panels</Box>
    </Container>
  )
}
