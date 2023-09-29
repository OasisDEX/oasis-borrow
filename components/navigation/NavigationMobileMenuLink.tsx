import { AppLink } from 'components/Links'
import { mobileLinkSx } from 'components/navigation/common'
import React from 'react'
import { Box } from 'theme-ui'

import type { NavigationMenuPanelLinkType } from './Navigation.types'

type NavigationMobileMenuLinkProps = NavigationMenuPanelLinkType

export function NavigationMobileMenuLink({ label, link }: NavigationMobileMenuLinkProps) {
  return (
    <>
      {link && (
        <Box key={`link-${label}`} as="li">
          <AppLink
            href={link}
            sx={{
              ...mobileLinkSx(false),
            }}
          >
            {label}
          </AppLink>
        </Box>
      )}
    </>
  )
}
