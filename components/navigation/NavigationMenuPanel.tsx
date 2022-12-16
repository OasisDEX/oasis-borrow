import React, { ReactNode } from 'react'
import { Box, Text } from 'theme-ui'

export interface NavigationMenuPanelAsset {
  token: string
  link: string
}
export interface NavigationMenuPanelLink {
  icon: string
  title: string
  link: string
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
  otherAssets?: NavigationMenuPanelAsset[]
}
type NavigationMenuPanelProps = NavigationMenuPanelType & {
  currentPanel?: string
  isPanelOpen: boolean
  onMouseEnter(center: number): void
}

export function NavigationMenuPanel({
  currentPanel,
  label,
  isPanelOpen,
  onMouseEnter,
}: NavigationMenuPanelProps) {
  return (
    <Box
      as="li"
      sx={{ p: 1 }}
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
          color: isPanelOpen && currentPanel === label ? 'primary100' : 'neutral80',
          cursor: 'default',
          transition: 'color 200ms',
        }}
      >
        {label}
      </Text>
    </Box>
  )
}
