import React, { ReactNode } from 'react'
import { Box, Text } from 'theme-ui'

export interface NavigationMenuPanelLink {
  icon?: string
  title: string
  footnote?: ReactNode
}
export interface NavigationMenuPanelProps {
  description: string
  label: string
  learn?: {
    label: string
    link: string
  }
  links: NavigationMenuPanelLink[]
}

export function NavigationMenuPanel({ label }: NavigationMenuPanelProps) {
  return (
    <Box as="li">
      <Text
        as="span"
        sx={{
          fontSize: 2,
          fontWeight: 'semiBold',
          color: 'neutral80',
          cursor: 'default',
          transition: 'color 200ms',
        }}
      >
        {label}
      </Text>
    </Box>
  )
}
