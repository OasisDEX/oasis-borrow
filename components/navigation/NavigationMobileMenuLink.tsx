import { AppLink } from 'components/Links'
import { mobileLinkSx } from 'components/navigation/common'
import { NavigationMenuPanelLinkType } from 'components/navigation/NavigationMenuLink'
import React from 'react'
import { Box } from 'theme-ui'

type NavigationMobileMenuLinkProps = NavigationMenuPanelLinkType

export function NavigationMobileMenuLink({ label, link }: NavigationMobileMenuLinkProps) {
  return (
    <Box key={`link-${label}`} as="li">
      <AppLink
        href={link}
        sx={{
          ...mobileLinkSx,
        }}
      >
        {label}
      </AppLink>
    </Box>
  )
}
