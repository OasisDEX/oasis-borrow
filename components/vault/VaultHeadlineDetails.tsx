import { Icon } from 'components/Icon'
import { StatefulTooltip } from 'components/Tooltip'
import React, { type ReactNode } from 'react'
import { sparks, tooltip } from 'theme/icons'
import { Flex, Text } from 'theme-ui'

export type HeadlineDetailsProp = {
  label: string
  labelTooltip?: ReactNode
  value: string | number
  sub?: string | string[]
  subColor?: string | string[]
  valueTooltip?: ReactNode
}

export function VaultHeadlineDetails({
  label,
  labelTooltip,
  sub,
  subColor,
  value,
  valueTooltip,
}: HeadlineDetailsProp) {
  const tooltipStyles = {
    top: '24px',
    fontSize: 1,
    border: 'none',
    borderRadius: 'medium',
    boxShadow: 'buttonMenu',
    fontWeight: 'regular',
    lineHeight: 'body',
  }

  return (
    <Flex
      sx={{
        position: 'relative',
        alignItems: 'center',
        fontSize: 3,
        mt: [2, 0],
        ml: [0, '12px'],
        pl: [0, '12px'],
        '::before': {
          content: ['none', '""'],
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '1px',
          height: '16px',
          margin: 'auto',
          backgroundColor: 'neutral60',
        },
        ':first-of-type': {
          ml: 0,
          pl: 0,
          '::before': {
            content: 'none',
          },
        },
      }}
    >
      {labelTooltip && (
        <StatefulTooltip tooltip={labelTooltip} containerSx={{ mr: 2 }} tooltipSx={tooltipStyles}>
          <Icon size={14} icon={tooltip} />
        </StatefulTooltip>
      )}
      <Text as="span" sx={{ color: 'neutral80' }}>
        {label}
      </Text>
      <Text as="span" sx={{ ml: 1, fontWeight: 'semiBold', color: 'primary100' }}>
        {value}
      </Text>
      {typeof sub === 'string' && subColor && (
        <Text as="span" sx={{ ml: 1, fontSize: 2, fontWeight: 'semiBold', color: subColor }}>
          {sub}
        </Text>
      )}
      {Array.isArray(sub) &&
        Array.isArray(subColor) &&
        sub.map((arrSub, arrSubIndex) => (
          <Text
            key={arrSub}
            as="span"
            sx={{ ml: 1, fontSize: 2, fontWeight: 'semiBold', color: subColor[arrSubIndex] }}
          >
            {arrSub}
          </Text>
        ))}
      {valueTooltip && (
        <StatefulTooltip tooltip={valueTooltip} containerSx={{ ml: 1 }} tooltipSx={tooltipStyles}>
          <Icon icon={sparks} size={16} color="interactive100" sx={{ ml: 1 }} />
        </StatefulTooltip>
      )}
    </Flex>
  )
}
