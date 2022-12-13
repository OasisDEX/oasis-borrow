import React, { ReactNode } from 'react'
import { Box, Text } from 'theme-ui'

export interface NavigationMenuPanelLink {
  icon?: string
  title: string
  footnote?: ReactNode
}
export interface NavigationMenuPanelType {
  description: string
  label: string
  learn?: {
    label: string
    link: string
  }
  links: NavigationMenuPanelLink[]
}
type NavigationMenuPanelProps = NavigationMenuPanelType & {
  currentPanel?: string
  onMouseEnter(center: number): void
}

export function NavigationMenuPanel({
  currentPanel,
  label,
  onMouseEnter,
}: NavigationMenuPanelProps) {
  return (
    <Box
      as="li"
      onMouseEnter={(e) => {
        const target = e.target as HTMLDivElement

        onMouseEnter(target.offsetLeft + target.offsetWidth / 2)
      }}
    >
      <Text
        as="span"
        sx={{
          fontSize: 2,
          fontWeight: 'semiBold',
          color: currentPanel === label ? 'primary100' : 'neutral80',
          cursor: 'default',
          transition: 'color 200ms',
        }}
      >
        {label}
      </Text>
    </Box>
  )
}
