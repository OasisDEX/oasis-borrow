import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Flex, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { GasEstimationStatus } from 'helpers/form'
import { formatAmount } from 'helpers/formatters/format'
import { CommonVaultState, WithChildren } from 'helpers/types'
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

export function getEstimatedGasFeeText(
  { gasEstimationStatus, gasEstimationUsd }: CommonVaultState,
  withBrackets = false,
) {
  switch (gasEstimationStatus) {
    case GasEstimationStatus.calculating:
      const textPending = 'Pending...'

      return (
        <Text sx={{ color: 'text.subtitle' }}>
          {withBrackets ? `(${textPending})` : textPending}
        </Text>
      )
    case GasEstimationStatus.error:
      const textError = 'Failed'

      return <Text sx={{ color: 'onError' }}>{withBrackets ? `(${textError})` : textError}</Text>
    case GasEstimationStatus.unknown:
    case GasEstimationStatus.unset:
    case undefined:
    case GasEstimationStatus.calculated:
      const textGas = `$${formatAmount(gasEstimationUsd as BigNumber, 'USD')}`

      return withBrackets ? `(${textGas})` : textGas
  }
}

export function VaultChangesInformationEstimatedGasFee(props: CommonVaultState) {
  return (
    <VaultChangesInformationItem
      label={'Estimated gas fee'}
      value={getEstimatedGasFeeText(props)}
    />
  )
}
