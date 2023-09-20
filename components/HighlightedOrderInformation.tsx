import { Skeleton } from 'components/Skeleton'
import { TokensGroup } from 'components/TokensGroup'
import type { ReactNode } from 'react'
import React from 'react'
import type { SxStyleProp } from 'theme-ui'
import { Text } from 'theme-ui'

interface EstimationOnCloseProps {
  isLoading?: boolean
  label: string
  symbol?: string
  value: ReactNode
  valueSx?: SxStyleProp
}

export function HighlightedOrderInformation({
  isLoading = false,
  label,
  symbol,
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
        {symbol && <TokensGroup tokens={[symbol]} forceSize={24} sx={{ mt: '-1px', mr: 1 }} />}
        {label}
      </Text>
      <Text as="span" sx={{ display: 'block', height: '100%', ...valueSx }}>
        {isLoading ? <Skeleton width={100} /> : value}
      </Text>
    </Text>
  )
}
