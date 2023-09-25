import type { ReactNode } from 'react'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

export function ManageSectionModal({
  heading,
  description,
}: {
  heading: string
  description: ReactNode
}) {
  return (
    <Grid gap={2}>
      <Heading variant="header3">{heading}</Heading>
      <Text as="p" variant="paragraph2" sx={{ mt: 2 }}>
        {description}
      </Text>
    </Grid>
  )
}
