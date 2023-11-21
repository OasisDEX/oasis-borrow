import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import { AppLink } from 'components/Links'
import type { PropsWithChildren } from 'react'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Button, Flex, Heading, Text } from 'theme-ui'

interface ActionBannerWithIcon {
  icon?: IconProps['icon']
  image?: never
}
interface ActionBannerWithImage {
  icon?: never
  image?: string
}

type ActionBannerProps = {
  cta?: {
    label: string
    onClick?: () => void
    targetBlank?: boolean
    url?: string
  }
  sx?: ThemeUIStyleObject
  title: string
} & (ActionBannerWithIcon | ActionBannerWithImage)

export function ActionBanner({
  children,
  cta,
  icon,
  image,
  sx,
  title,
}: PropsWithChildren<ActionBannerProps>) {
  return (
    <Flex
      sx={{
        flexDirection: ['column', 'row'],
        rowGap: 3,
        columnGap: 4,
        alignItems: 'center',
        p: 3,
        borderRadius: 'mediumLarge',
        boxShadow: 'buttonMenu',
        ...sx,
      }}
    >
      {(icon || image) && (
        <Flex sx={{ flexShrink: 0, 'svg, img': { display: 'block' } }}>
          {icon && <Icon icon={icon} size={60} />}
        </Flex>
      )}
      <Flex sx={{ flexDirection: 'column', rowGap: 1 }}>
        <Heading as="h3" variant="boldParagraph2">
          {title}
        </Heading>
        {children && (
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {children}
          </Text>
        )}
      </Flex>
      {cta && (
        <Box sx={{ flexShrink: 0, ml: 'auto' }}>
          {cta.url ? (
            <AppLink
              href={cta.url}
              internalInNewTab={cta.targetBlank}
              {...(cta.onClick && { onClick: cta.onClick })}
            >
              <Button variant="action">{cta.label}</Button>
            </AppLink>
          ) : (
            cta.onClick && (
              <Button variant="action" onClick={cta.onClick}>
                {cta.label}
              </Button>
            )
          )}
        </Box>
      )}
    </Flex>
  )
}
