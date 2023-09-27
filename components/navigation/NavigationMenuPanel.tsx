import { AppLink } from 'components/Links'
import React from 'react'
import { Box, Text } from 'theme-ui'

import type { NavigationMenuPanelProps } from './Navigation.types'

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
