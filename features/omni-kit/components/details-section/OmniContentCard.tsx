import type {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCardLinkProps,
} from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import { Skeleton } from 'components/Skeleton'
import { StatefulTooltip } from 'components/Tooltip'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React, { type ReactNode } from 'react'
import { Flex, Image, type Theme } from 'theme-ui'
import type { TranslationType } from 'ts_modules/i18next'

export interface OmniContentCardTranslation {
  key: string
  values?: { [key: string]: string }
}

export type OmniContentCardValue = string | OmniContentCardTranslation

export interface OmniContentCardBase {
  change?: OmniContentCardValue[]
  footnote?: OmniContentCardValue[]
  modal?: ReactNode
  title: OmniContentCardValue
  unit?: string
  value?: OmniContentCardValue
  link?: DetailsSectionContentCardLinkProps
}

export interface OmniContentCardExtra {
  asFooter?: boolean
  changeVariant?: ChangeVariantType
  customValueColor?: string
  extra?: ReactNode
  icon?: IconProps['icon']
  iconColor?: string
  iconPosition?: 'before' | 'after'
  iconImage?: string
  isLoading?: boolean
  isValueLoading?: boolean
  modal?: ReactNode
  link?: DetailsSectionContentCardLinkProps
  tooltips?: {
    change?: ReactNode
    footnote?: ReactNode
    icon?: ReactNode
    value?: ReactNode
  }
  customTooltipWidth?: string[]
}

export interface OmniContentCardDataWithModal {
  modal?: ReactNode
}

export interface OmniContentCardDataWithTheme {
  theme?: Theme
}

type OmniContentCardProps = OmniContentCardBase & OmniContentCardExtra

function getContentCardValue(value: string | OmniContentCardTranslation, t: TranslationType) {
  return typeof value === 'string' ? value : t(value.key, value.values)
}

export function OmniContentCard({
  asFooter,
  change,
  changeVariant,
  customValueColor,
  extra,
  footnote,
  icon,
  iconColor = 'interactive100',
  iconPosition = 'before',
  iconImage,
  isLoading,
  modal,
  title,
  tooltips: {
    change: changeTooltip,
    footnote: footnoteTooltip,
    icon: iconTooltip,
    value: valueTooltip,
  } = {},
  customTooltipWidth,
  unit,
  value,
  isValueLoading = false,
  link,
}: OmniContentCardProps) {
  const { t } = useTranslation()

  const valueIcon = (
    <>
      {icon &&
        (iconTooltip ? (
          <StatefulTooltip
            inline
            tooltip={iconTooltip}
            containerSx={{
              position: 'relative',
              top: '2px',
              display: 'inline-block',
              mr: iconPosition === 'before' ? 1 : 0,
              ml: iconPosition === 'after' ? 1 : 0,
            }}
            tooltipSx={{
              width: customTooltipWidth || '300px',
              fontSize: 1,
              whiteSpace: 'initial',
              textAlign: 'left',
              border: 'none',
              borderRadius: 'medium',
              boxShadow: 'buttonMenu',
              fontWeight: 'regular',
              lineHeight: 'body',
            }}
          >
            <Icon
              size={asFooter ? 16 : 24}
              icon={icon}
              color={iconColor}
              sx={{ mt: asFooter ? 1 : 0 }}
            />
          </StatefulTooltip>
        ) : (
          <Icon
            size={asFooter ? 16 : 24}
            icon={icon}
            color={iconColor}
            sx={{ mt: asFooter ? 1 : 0, mr: 1 }}
          />
        ))}
    </>
  )

  const valueImage = (
    <>
      {iconImage && (
        <Flex
          as="span"
          sx={{
            position: 'relative',
            top: '2px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            mt: '-2px',
            mr: iconPosition === 'before' ? 1 : 0,
            ml: iconPosition === 'after' ? 1 : 0,
            border: '1px solid',
            borderColor: 'neutral20',
            borderRadius: 'ellipse',
            bg: 'neutral10',
          }}
        >
          <Image src={staticFilesRuntimeUrl(iconImage)} sx={{ width: '14px', height: '14px' }} />
        </Flex>
      )}
    </>
  )

  const contentCardSettings: ContentCardProps = {
    title: getContentCardValue(title, t),
    value: !isValueLoading ? (
      <>
        {iconPosition === 'before' && (
          <>
            {valueIcon}
            {valueImage}
          </>
        )}
        {value && getContentCardValue(value, t)}
        {iconPosition === 'after' && (
          <>
            {valueIcon}
            {valueImage}
          </>
        )}
      </>
    ) : (
      <Skeleton width="150px" height="38px" sx={{ mt: '5px', borderRadius: 'mediumLarge' }} />
    ),
    customValueColor,
    valueTooltip: valueTooltip,
    unit: isValueLoading ? '' : unit,
    change: {
      isLoading,
      value: change && change.map((item) => getContentCardValue(item, t)),
      variant: changeVariant,
      tooltip: changeTooltip,
      withAfter: true,
    },
    ...(footnote && {
      footnote: footnote.map((item) => getContentCardValue(item, t)),
      footnoteTooltip: footnoteTooltip,
    }),
    link,
    extra,
    modal,
    asFooter,
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
