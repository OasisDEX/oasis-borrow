import React, { PropsWithChildren } from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

export interface DetailsSectionContentSimpleModalProps {
  description?: string
  title: string
  value?: string
}

export function DetailsSectionContentSimpleModal({
  children,
  description,
  title,
  value,
}: PropsWithChildren<DetailsSectionContentSimpleModalProps>) {
  return (
    <Grid gap={2}>
      <Heading variant="header5" sx={{ fontWeight: 'bold' }}>
        {title}
      </Heading>
      {description && (
        <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
          {description}
        </Text>
      )}
      <>{children}</>
      {value && (
        <Card variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
          {value}
        </Card>
      )}
    </Grid>
  )
}
