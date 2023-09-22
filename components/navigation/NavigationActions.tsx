import type { PropsWithChildren } from 'react'
import React from 'react'
import { Flex } from 'theme-ui'

interface NavigationActionsProps {}

export function NavigationActions({ children }: PropsWithChildren<NavigationActionsProps>) {
  return (
    <Flex
      sx={{
        flexShrink: 0,
        columnGap: 2,
        ml: 'auto',
        zIndex: 2,
      }}
    >
      {children}
    </Flex>
  )
}
