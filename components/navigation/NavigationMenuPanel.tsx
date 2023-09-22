import { AppLink } from 'components/Links'
import type { ReactNode } from 'react'
import React from 'react'
import { Box, Text } from 'theme-ui'

export interface NavigationMenuPanelAsset {
  token: string
  link: string
}

export interface NavigationMenuPanelLink {
  icon: string
  title: string
  link: string
  hash?: string
  footnote?: ReactNode
}

export interface NavigationMenuPanelIcon {
  type?: 'icon' | 'image'
  source: string
  position?: 'global' | 'title'
}

export interface NavigationMenuPanelList {
  items: {
    description?: ReactNode
    icon?: NavigationMenuPanelIcon
    list: Omit<NavigationMenuPanelList, 'items.list'>
    hoverColor?: string
    tags?: string[]
    title: string
  }[]
  link?: {
    label: string
    url: string
  }
}

export interface NavigationMenuPanelType {
  label: string
  lists: NavigationMenuPanelList[]
  url?: string
}
type NavigationMenuPanelProps = NavigationMenuPanelType & {
  currentPanel?: string
  isPanelOpen: boolean
  onMouseEnter(center: number): void
}

function NavigationMenuPanelLabel({
  currentPanel,
  label,
  isPanelOpen,
}: Pick<NavigationMenuPanelProps, 'currentPanel' | 'label' | 'isPanelOpen'>) {
  return (
    <Text
      as="span"
      sx={{
        fontSize: 2,
        fontWeight: 'semiBold',
        color: isPanelOpen && currentPanel === label ? 'primary100' : 'neutral80',
        whiteSpace: 'nowrap',
        cursor: 'inherit',
        transition: 'color 200ms',
      }}
    >
      {label}
    </Text>
  )
}

export function NavigationMenuPanel({
  currentPanel,
  label,
  url,
  isPanelOpen,
  onMouseEnter,
}: NavigationMenuPanelProps) {
  return (
    <Box
      as="li"
      sx={{
        flexShrink: 0,
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        const target = e.target as HTMLDivElement

        onMouseEnter(target.offsetLeft + target.offsetWidth / 2)
      }}
    >
      {url ? (
        <AppLink href={url}>
          <NavigationMenuPanelLabel
            currentPanel={currentPanel}
            label={label}
            isPanelOpen={isPanelOpen}
          />
        </AppLink>
      ) : (
        <NavigationMenuPanelLabel
          currentPanel={currentPanel}
          label={label}
          isPanelOpen={isPanelOpen}
        />
      )}
    </Box>
  )
}
