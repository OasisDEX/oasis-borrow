import { AppLink } from 'components/Links'
import React, { ReactNode } from 'react'
import { Box } from 'theme-ui'

export interface NavigationMenuPanelLinkProps {
  label: ReactNode
  link: string
}

export function NavigationMenuLink({ label, link }: NavigationMenuPanelLinkProps) {
  return (
    <Box as="li">
      <AppLink
        href={link}
        sx={{
          color: 'neutral80',
          transition: 'color 200ms',
          '&:hover': { color: 'primary100' },
        }}
      >
        {label}
      </AppLink>
    </Box>
  )
}
