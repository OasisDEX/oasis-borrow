import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'
import type { SxStyleProp } from 'theme-ui'
import { Card, Grid, Text } from 'theme-ui'

export function Label({ children, sx }: React.PropsWithChildren<{ sx?: SxStyleProp }>) {
  return (
    <Text variant="paragraph3" sx={{ color: 'neutral80Alt', whiteSpace: 'nowrap', ...sx }}>
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

export function Details({ children }: WithChildren) {
  return (
    <Card bg="neutral30" sx={{ border: 'none' }}>
      <Grid columns={'auto 1fr'} gap={2}>
        {children}
      </Grid>
    </Card>
  )
}

Details.Item = DetailsItem
