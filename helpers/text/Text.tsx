import { BigNumber } from 'bignumber.js'
import * as React from 'react'
import { Text } from 'theme-ui'

import { zero } from '../zero'

export const InfoLabel = ({ children, ...props }: { children: any } | any) => (
  <Text variant="infoLabel" {...props}>
    {children}
  </Text>
)

export const Muted = ({ children, ...props }: { children: any } | any) => (
  <Text variant="muted" {...props}>
    {children}
  </Text>
)

export const RedSpan = ({ children }: { children: any }) => (
  <Text sx={{ color: 'error' }}>{children}</Text>
)

export const GreenSpan = ({ children }: { children: any }) => (
  <Text sx={{ color: 'onSuccess' }}>{children}</Text>
)

export const SellBuySpan = ({ children, type }: { children: any; type: string }) => {
  switch (type) {
    case 'sell':
      return <RedSpan>{children}</RedSpan>
    case 'buy':
      return <GreenSpan>{children}</GreenSpan>
    default:
      return <Text>{children}</Text>
  }
}

// Colored span - red if value is smaller than middleValue, green if is greater
export const BoundarySpan = ({
  children,
  value,
  middleValue = zero,
  middleAs = 'neutral',
}: {
  children: any
  value: BigNumber
  middleValue?: BigNumber
  middleAs?: 'greater' | 'lower' | 'neutral'
}) => {
  if (middleValue) {
    if (value.gt(middleValue) || (value.eq(middleValue) && middleAs === 'greater')) {
      return <GreenSpan>{children}</GreenSpan>
    }
    if (value.lt(middleValue) || (value.eq(middleValue) && middleAs === 'lower')) {
      return <RedSpan>{children}</RedSpan>
    }
  }
  return <Text>{children}</Text>
}

export const Currency = ({
  value,
}: {
  value: string
  theme?: 'bold' | 'semi-bold' | 'medium' | 'none'
}) => <span data-test-id="currency">{value}</span>
