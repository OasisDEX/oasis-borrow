import type { PropsWithChildren } from 'react'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Container, Flex } from 'theme-ui'

export interface BasicLayoutProps extends PropsWithChildren<{}> {
  header: JSX.Element
  footer?: JSX.Element
  sx?: ThemeUIStyleObject
  variant?: string
  bg: JSX.Element | null
}

export function BasicLayout({ header, footer, children, sx, variant, bg }: BasicLayoutProps) {
  return (
    <Flex
      sx={{
        bg: 'none',
        flexDirection: 'column',
        minHeight: '100%',
        ...sx,
      }}
    >
      {bg}
      {header}
      <Container variant={variant ?? 'appContainer'} sx={{ flex: 2, mb: 5 }} as="main">
        <Flex sx={{ width: '100%', height: '100%' }}>{children}</Flex>
      </Container>
      {footer}
    </Flex>
  )
}
