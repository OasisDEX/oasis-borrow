import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Flex, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { Tooltip, useTooltip } from 'components/Tooltip'
import { GasEstimationStatus } from 'helpers/form'
import { formatAmount } from 'helpers/formatters/format'
import { CommonVaultState, WithChildren } from 'helpers/types'
import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export function VaultChangesInformationItem({
  label,
  value,
  tooltip,
}: {
  label: string
  value: ReactNode
  tooltip?: ReactNode
}) {
  const { tooltipOpen, setTooltipOpen } = useTooltip()
  const isTouchDevice = window && 'ontouchstart' in window

  return (
    <Flex
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 1,
        fontWeight: 'semiBold',
        cursor: tooltip ? 'pointer' : 'inherit',
      }}
      onClick={() => tooltip && setTooltipOpen(true)}
    >
      <Flex
        sx={{ color: 'text.subtitle', justifyContent: 'flex-end' }}
        onMouseEnter={!isTouchDevice ? () => setTooltipOpen(true) : undefined}
        onMouseLeave={!isTouchDevice ? () => setTooltipOpen(false) : undefined}
      >
        <Box>{label}</Box>
        {tooltip && <Icon name="question_o" size="20px" sx={{ ml: 1 }} />}
      </Flex>
      {tooltip && tooltipOpen && <Tooltip sx={{ transform: 'translateY(60%)' }}>{tooltip}</Tooltip>}
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
    case GasEstimationStatus.unknown:
    case GasEstimationStatus.unset:
    case undefined:
      const textError = 'n/a'

      return <Text sx={{ color: 'onError' }}>{withBrackets ? `(${textError})` : textError}</Text>
    case GasEstimationStatus.calculated:
      const textGas = `$${formatAmount(gasEstimationUsd as BigNumber, 'USD')}`

      return withBrackets ? `(${textGas})` : textGas
  }
}

export function VaultChangesInformationEstimatedGasFee(props: CommonVaultState) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationItem
      label={t('max-gas-fee')}
      value={getEstimatedGasFeeText(props)}
      tooltip={<Box>{t('gas-explanation')}</Box>}
    />
  )
}
