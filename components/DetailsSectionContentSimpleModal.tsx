import type { FC, ReactNode } from 'react'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

export interface DetailsSectionContentSimpleModalProps {
  title: string
  description?: string
  value?: ReactNode
}

export const DetailsSectionContentSimpleModal: FC<DetailsSectionContentSimpleModalProps> = ({
  title,
  children,
  description,
  value,
}) => (
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
