import { useCoolMode } from 'helpers/sweet/useCoolMode'
import { WithChildren } from 'helpers/types'
import React, { Ref } from 'react'
import { Container, Flex, SxStyleProp } from 'theme-ui'

export interface BasicLayoutProps extends WithChildren {
  header: JSX.Element
  footer?: JSX.Element
  sx?: SxStyleProp
  variant?: string
  bg: JSX.Element | null
}

export function BasicLayout({ header, footer, children, sx, variant, bg }: BasicLayoutProps) {
  const ref = useCoolMode()
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
      <Container
        variant={variant || 'appContainer'}
        sx={{ flex: 2, mb: 5 }}
        as="main"
        ref={ref as Ref<HTMLDivElement>}
      >
        <Flex sx={{ width: '100%', height: '100%' }}>{children}</Flex>
      </Container>
      {footer}
    </Flex>
  )
}
