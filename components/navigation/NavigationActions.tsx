import React, { PropsWithChildren } from 'react'
import { Flex } from 'theme-ui'

interface NavigationActionsProps {}

export function NavigationActions({ children }: PropsWithChildren<NavigationActionsProps>) {
  return <Flex sx={{ columnGap: 2 }}>{children}</Flex>
}
