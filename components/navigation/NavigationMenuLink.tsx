import { AppLink } from 'components/Links'
import React, { ReactNode } from 'react'
import { Box } from 'theme-ui'

export interface NavigationMenuPanelLinkType {
  label: ReactNode
  link: string
}
type NavigationMenuPanelLinkProps = NavigationMenuPanelLinkType & {
  onMouseEnter(): void
}

export function NavigationMenuLink({ label, link, onMouseEnter }: NavigationMenuPanelLinkProps) {
  return (
    <Box
      as="li"
      sx={{
        p: 1,
        flexShrink: 0,
      }}
      onMouseEnter={onMouseEnter}
    >
      <AppLink
        href={link}
        sx={{
          color: 'neutral80',
          whiteSpace: 'nowrap',
          transition: 'color 200ms',
          '&:hover': { color: 'primary100' },
        }}
      >
        {label}
      </AppLink>
    </Box>
  )
}
