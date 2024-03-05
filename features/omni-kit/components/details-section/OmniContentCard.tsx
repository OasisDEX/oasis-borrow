import type {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCardLinkProps,
} from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import { StatefulTooltip } from 'components/Tooltip'
import { useTranslation } from 'next-i18next'
import React, { type ReactNode } from 'react'
import type { Theme } from 'theme-ui'
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
  isLoading?: boolean
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

  const contentCardSettings: ContentCardProps = {
    title: getContentCardValue(title, t),
    value: (
      <>
        {iconPosition === 'before' && valueIcon}
        {value && getContentCardValue(value, t)}
        {iconPosition === 'after' && valueIcon}
      </>
    ),
    customValueColor,
    valueTooltip: valueTooltip,
    unit,
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
