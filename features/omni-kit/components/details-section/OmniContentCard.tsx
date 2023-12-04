import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import { StatefulTooltip } from 'components/Tooltip'
import { useTranslation } from 'next-i18next'
import React, { type ReactNode } from 'react'
import type { TranslationType } from 'ts_modules/i18next'

export interface OmniContentCardTranslation {
  key: string
  values?: { [key: string]: string }
}

export type OmniContentCardValue = string | OmniContentCardTranslation

export interface OmniContentCardBase {
  change?: OmniContentCardValue[]
  footnote?: OmniContentCardValue[]
  title: OmniContentCardValue
  unit?: string
  value: OmniContentCardValue
}

export interface OmniContentCardExtra {
  asFooter?: boolean
  changeVariant?: ChangeVariantType
  extra?: ReactNode
  icon?: IconProps['icon']
  isLoading?: boolean
  modal?: ReactNode
  tooltips?: {
    change?: ReactNode
    footnote?: ReactNode
    icon?: ReactNode
    value?: ReactNode
  }
}

type OmniContentCardProps = OmniContentCardBase & OmniContentCardExtra

function getContentCardValue(value: string | OmniContentCardTranslation, t: TranslationType) {
  return typeof value === 'string' ? value : t(value.key, value.values)
}

export function OmniContentCard({
  asFooter,
  change,
  changeVariant,
  extra,
  footnote,
  icon,
  isLoading,
  modal,
  title,
  tooltips: {
    change: changeTooltip,
    footnote: footnoteTooltip,
    icon: iconTooltip,
    value: valueTooltip,
  } = {},
  unit,
  value,
}: OmniContentCardProps) {
  const { t } = useTranslation()

  const contentCardSettings: ContentCardProps = {
    title: getContentCardValue(title, t),
    value: (
      <>
        {icon &&
          (iconTooltip ? (
            <StatefulTooltip
              inline
              tooltip={iconTooltip}
              containerSx={{ position: 'relative', top: '2px', display: 'inline-block', mr: 1 }}
              tooltipSx={{
                width: '300px',
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
                color="interactive100"
                sx={{ mt: asFooter ? 1 : 0 }}
              />
            </StatefulTooltip>
          ) : (
            <Icon
              size={asFooter ? 16 : 24}
              icon={icon}
              color="interactive100"
              sx={{ mt: asFooter ? 1 : 0, mr: 1 }}
            />
          ))}
        {getContentCardValue(value, t)}
      </>
    ),
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
    extra,
    modal,
    asFooter,
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
