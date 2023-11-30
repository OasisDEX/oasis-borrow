import type { FC, ReactNode } from 'react'
import React from 'react'
import type { Theme } from 'theme-ui'
import { Card, Grid, Heading, Text, ThemeUIProvider } from 'theme-ui'

export interface DetailsSectionContentSimpleModalProps {
  description?: ReactNode
  theme?: Theme
  title: string
  value?: ReactNode
}

const DetailsSectionContentSimpleModalContent: FC<
  Omit<DetailsSectionContentSimpleModalProps, 'theme'>
> = ({ title, children, description, value }) => (
  <Grid gap={3}>
    <Heading variant="header5" sx={{ fontWeight: 'bold' }}>
      {title}
    </Heading>
    {description && (
      <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
        {description}
      </Text>
    )}
    {value && <Card variant="vaultDetailsCardModal">{value}</Card>}
    <>{children}</>
  </Grid>
)

export const DetailsSectionContentSimpleModal: FC<DetailsSectionContentSimpleModalProps> = ({
  theme,
  ...rest
}) =>
  theme ? (
    <ThemeUIProvider theme={theme}>
      <DetailsSectionContentSimpleModalContent {...rest} />
    </ThemeUIProvider>
  ) : (
    <DetailsSectionContentSimpleModalContent {...rest} />
  )
