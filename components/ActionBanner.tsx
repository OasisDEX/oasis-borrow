import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import { AppLink } from 'components/Links'
import { kebabCase } from 'lodash'
import type { PropsWithChildren } from 'react'
import React, { useState } from 'react'
import { close } from 'theme/icons'
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
  closingSaveKey?: string
  cta?: {
    label: string
    onClick?: () => void
    targetBlank?: boolean
    url?: string
  }
  sx?: ThemeUIStyleObject
  title: string
  withClose?: boolean
} & (ActionBannerWithIcon | ActionBannerWithImage)

function getSessionStorageKey(suffix: string): string {
  return `action-banner-${kebabCase(suffix)}`
}

export function ActionBanner({
  closingSaveKey,
  children,
  cta,
  icon,
  image,
  sx,
  title,
  withClose,
}: PropsWithChildren<ActionBannerProps>) {
  const [isBannerClosed, setIsBannerClosed] = useState<boolean>(
    closingSaveKey ? sessionStorage.getItem(getSessionStorageKey(closingSaveKey)) === '1' : false,
  )

  return !isBannerClosed ? (
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
      <Flex sx={{ flexDirection: 'column', flexGrow: 1, rowGap: 1 }}>
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
      {withClose && (
        <Button
          variant="unStyled"
          sx={{ ml: 'auto', p: 1, lineHeight: 0 }}
          onClick={() => {
            if (closingSaveKey) sessionStorage.setItem(getSessionStorageKey(closingSaveKey), '1')
            setIsBannerClosed(true)
          }}
        >
          <Icon size="12px" icon={close} />
        </Button>
      )}
    </Flex>
  ) : (
    <></>
  )
}
