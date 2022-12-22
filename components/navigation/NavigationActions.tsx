import React, { PropsWithChildren } from 'react'
import { Flex } from 'theme-ui'

interface NavigationActionsProps {}

export function NavigationActions({ children }: PropsWithChildren<NavigationActionsProps>) {
  return <Flex sx={{ flexShrink: 0, columnGap: 2, zIndex: 1 }}>{children}</Flex>
}
