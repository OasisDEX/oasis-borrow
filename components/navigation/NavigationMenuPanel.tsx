import { AppLink } from 'components/Links'
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
  hash?: string
  footnote?: ReactNode
}
export interface NavigationMenuPanelType {
  description: string
  label: string
  learn?: {
    label: string
    link: string
  }
  link?: string
  links: NavigationMenuPanelLink[]
  otherAssets?: NavigationMenuPanelAsset[]
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
  link,
  isPanelOpen,
  onMouseEnter,
}: NavigationMenuPanelProps) {
  return (
    <Box
      as="li"
      sx={{
        p: 1,
        flexShrink: 0,
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        const target = e.target as HTMLDivElement

        onMouseEnter(target.offsetLeft + target.offsetWidth / 2)
      }}
    >
      {link ? (
        <AppLink href={link}>
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
