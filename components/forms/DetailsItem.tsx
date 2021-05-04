import React from 'react'
import { SxStyleProp, Text } from 'theme-ui'

export function Label({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Text variant="paragraph3" sx={{ color: 'mutedAlt', whiteSpace: 'nowrap', ...sx }}>
      {children}
    </Text>
  )
}
export function Value({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Text variant="paragraph3" sx={{ textAlign: 'right', fontWeight: 'semiBold', ...sx }}>
      {children}
    </Text>
  )
}

export function DetailsItem({
  header,
  value,
}: {
  header: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <>
      <Label>{header}</Label>
      <Value>{value}</Value>
    </>
  )
}
