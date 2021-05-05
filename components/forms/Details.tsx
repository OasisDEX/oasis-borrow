import React from 'react'
import { Card, Grid, SxStyleProp, Text } from 'theme-ui'

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

export function DetailsItem({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <>
      <Label>{label}</Label>
      <Value>{value}</Value>
    </>
  )
}

export function Details({ children }: React.PropsWithChildren<{}>) {
  return (
    <Card bg="secondaryAlt" sx={{ border: 'none' }}>
      <Grid columns={'auto 1fr'}>{children}</Grid>
    </Card>
  )
}

Details.Item = DetailsItem
