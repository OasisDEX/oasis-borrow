import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import { AppLink } from 'components/Links'
import { kebabCase } from 'lodash'
import type { PropsWithChildren } from 'react'
import React, { useState } from 'react'
import { close } from 'theme/icons'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Button, Flex, Heading, Image, Text } from 'theme-ui'

interface ActionBannerWithIcon {
  icon?: IconProps['icon']
  image?: never
}
interface ActionBannerWithImage {
  icon?: never
  image?: string
}
type CtaType = {
  label: string
  onClick?: () => void
  targetBlank?: boolean
  url?: string
}

export type ActionBannerType = {
  closingSaveKey?: string
  cta?: CtaType | CtaType[]
  sx?: ThemeUIStyleObject
  buttonSx?: ThemeUIStyleObject
  title: string
  withClose?: boolean
  lightText?: boolean
  customCtaVariant?: string
} & (ActionBannerWithIcon | ActionBannerWithImage)

export type ActionBannerProps = PropsWithChildren<ActionBannerType>

function getSessionStorageKey(suffix: string): string {
  return `action-banner-${kebabCase(suffix)}`
}

const CtaComponent = ({
  cta,
  customCtaVariant,
  lightText,
  buttonSx,
}: {
  cta: ActionBannerProps['cta']
  customCtaVariant: ActionBannerProps['customCtaVariant']
  lightText: ActionBannerProps['lightText']
  buttonSx?: ActionBannerProps['buttonSx']
}) => {
  if (Array.isArray(cta)) {
    return (
      <>
        {cta.map((ctaItem, index) => (
          <CtaComponent
            key={`CtaItem_${ctaItem.label}_${ctaItem.url}_${index}`}
            cta={ctaItem}
            lightText={lightText}
            customCtaVariant={customCtaVariant}
          />
        ))}
      </>
    )
  }
  return cta ? (
    <Box sx={{ flexShrink: 0, ml: 'auto' }}>
      {cta.url ? (
        <AppLink
          href={cta.url}
          internalInNewTab={cta.targetBlank}
          {...(cta.onClick && { onClick: cta.onClick })}
        >
          <Button
            variant={customCtaVariant ?? 'action'}
            sx={{ color: lightText ? 'neutral10' : undefined, ...buttonSx }}
          >
            {cta.label}
          </Button>
        </AppLink>
      ) : (
        cta.onClick && (
          <Button
            variant={customCtaVariant ?? 'action'}
            sx={{ color: lightText ? 'neutral10' : undefined, ...buttonSx }}
            onClick={cta.onClick}
          >
            {cta.label}
          </Button>
        )
      )}
    </Box>
  ) : null
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
  lightText = false,
  customCtaVariant,
  buttonSx,
}: ActionBannerProps) {
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
          {image && <Image src={image} alt={title} />}
        </Flex>
      )}
      <Flex sx={{ flexDirection: 'column', flexGrow: 1, rowGap: 1 }}>
        <Heading
          as="h3"
          variant="boldParagraph2"
          sx={{ color: lightText ? 'neutral10' : undefined }}
        >
          {title}
        </Heading>
        {children && (
          <Text as="p" variant="paragraph3" sx={{ color: lightText ? 'neutral10' : 'neutral80' }}>
            {children}
          </Text>
        )}
      </Flex>
      {cta && (
        <CtaComponent
          cta={cta}
          lightText={lightText}
          customCtaVariant={customCtaVariant}
          buttonSx={buttonSx}
        />
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
