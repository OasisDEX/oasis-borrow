import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import { AppLink } from 'components/Links'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Button, Flex, Text } from 'theme-ui'

interface BannerTransparentProps {
  icon: IconProps['icon']
  title: string
  cta?: {
    label: string
    url: string
  }
}

export function BannerTransparent({
  icon,
  title,
  children,
  cta,
}: PropsWithChildren<BannerTransparentProps>) {
  return (
    <Flex
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 3,
        background: 'linear-gradient(90.61deg, #FFFFFF 0.79%, rgba(255, 255, 255, 0) 99.94%)',
        borderRadius: 'large',
        boxShadow: 'cardLanding',
      }}
    >
      <Icon icon={icon} size={60} sx={{ mr: 3 }} />
      <Flex sx={{ flexDirection: 'column', width: '100%' }}>
        <Text variant="boldParagraph2">{title}</Text>
        <Text variant="paragraph3">{children}</Text>
      </Flex>
      {cta && (
        <AppLink href={cta.url} sx={{ flexShrink: 0, ml: 'auto' }}>
          <Button variant="action">{cta.label}</Button>
        </AppLink>
      )}
    </Flex>
  )
}
