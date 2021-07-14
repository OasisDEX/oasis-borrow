import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Flex, Grid, Text } from '@theme-ui/components'
import { WithChildren } from 'helpers/types'
import React, { ReactNode } from 'react'

export function VaultChangesInformationItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Flex
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 1,
        fontWeight: 'semiBold',
      }}
    >
      <Box sx={{ color: 'text.subtitle' }}>{label}</Box>
      <Box>{value}</Box>
    </Flex>
  )
}

export function VaultChangesInformationContainer({
  title,
  children,
}: { title: string } & WithChildren) {
  return (
    <Grid>
      <Text variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
        {title}
      </Text>
      {children}
    </Grid>
  )
}

export function VaultChangesInformationArrow() {
  return <Icon name="arrow_right_light" size="auto" width="10px" height="7px" sx={{ mx: 2 }} />
}
