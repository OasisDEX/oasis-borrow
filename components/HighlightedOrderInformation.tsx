import { Icon } from '@makerdao/dai-ui-icons'
import React, { ReactNode } from 'react'
import { SxStyleProp, Text } from 'theme-ui'

interface EstimationOnCloseProps {
  label: string
  value: ReactNode
  iconCircle?: string
  valueSx?: SxStyleProp
}

export function HighlightedOrderInformation({
  iconCircle,
  label,
  value,
  valueSx,
}: EstimationOnCloseProps) {
  return (
    <Text
      as="p"
      variant="paragraph3"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 'semiBold',
      }}
    >
      <Text as="span" sx={{ display: 'flex', color: 'neutral80' }}>
        {iconCircle && <Icon name={iconCircle} size="24px" sx={{ mt: '-1px', mr: 1 }} />}
        {label}
      </Text>
      <Text as="span" sx={{ display: 'block', height: '100%', ...valueSx }}>
        {value}
      </Text>
    </Text>
  )
}
