import { Icon } from '@makerdao/dai-ui-icons'
import { Skeleton } from 'components/Skeleton'
import React, { ReactNode } from 'react'
import { SxStyleProp, Text } from 'theme-ui'

interface EstimationOnCloseProps {
  label: string
  value: ReactNode
  iconCircle?: string
  valueSx?: SxStyleProp
  isLoading?: boolean
}

export function HighlightedOrderInformation({
  iconCircle,
  label,
  value,
  valueSx,
  isLoading = false,
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
        {isLoading ? <Skeleton width={100} /> : value}
      </Text>
    </Text>
  )
}
