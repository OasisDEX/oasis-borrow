import { Icon } from 'components/Icon'
import type { IconProps } from 'components/Icon.types'
import { StatefulTooltip } from 'components/Tooltip'
import React, { type ReactNode } from 'react'
import { tooltip } from 'theme/icons'
import { Flex, Text } from 'theme-ui'

export type HeadlineDetailsProp = {
  label: string
  labelIcon?: IconProps['icon']
  labelTooltip?: ReactNode
  value: string | number
  sub?: string | string[]
  subColor?: string | string[]
}

export function VaultHeadlineDetails({
  label,
  labelIcon,
  labelTooltip,
  sub,
  subColor,
  value,
}: HeadlineDetailsProp) {
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
        <StatefulTooltip
          tooltip={labelTooltip}
          containerSx={{ mr: 2 }}
          tooltipSx={{
            top: '24px',
            fontSize: 1,
            border: 'none',
            borderRadius: 'medium',
            boxShadow: 'buttonMenu',
            fontWeight: 'regular',
            lineHeight: 'body',
          }}
        >
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
      {labelIcon && <Icon icon={labelIcon} size={16} color="interactive100" sx={{ ml: 1 }} />}
    </Flex>
  )
}
