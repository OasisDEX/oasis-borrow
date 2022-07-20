import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Flex, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { Tooltip, useTooltip } from 'components/Tooltip'
import { GasEstimationStatus, HasGasEstimation } from 'helpers/form'
import { formatAmount } from 'helpers/formatters/format'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useCallback, useMemo } from 'react'

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

  const handleMouseEnter = useMemo(
    () => (!isTouchDevice ? () => setTooltipOpen(true) : undefined),
    [isTouchDevice],
  )

  const handleMouseLeave = useMemo(
    () => (!isTouchDevice ? () => setTooltipOpen(false) : undefined),
    [isTouchDevice],
  )

  const handleClick = useCallback(() => tooltip && setTooltipOpen(true), [tooltip])

  return (
    <Flex
      as="li"
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 1,
        fontWeight: 'semiBold',
        cursor: tooltip ? 'pointer' : 'inherit',
        position: 'relative',
      }}
      onClick={handleClick}
    >
      <Flex
        sx={{ color: 'neutral80', justifyContent: 'flex-end' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {label}
        {tooltip && <Icon name="question_o" size="20px" sx={{ ml: 1 }} />}
      </Flex>
      {tooltip && tooltipOpen && (
        <Tooltip sx={{ transform: 'translateY(60%)', top: -230, right: ['0px', 'auto'] }}>
          {tooltip}
        </Tooltip>
      )}
      <Box sx={{ color: 'primary100' }}>{value}</Box>
    </Flex>
  )
}

export function VaultChangesInformationContainer({
  title,
  children,
}: { title: string } & WithChildren) {
  return (
    <Grid
      as="ul"
      sx={{
        p: 3,
        backgroundColor: 'neutral30',
        borderRadius: 'medium',
      }}
    >
      <Box as="li" sx={{ listStyle: 'none' }}>
        <Text as="h3" variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
          {title}
        </Text>
      </Box>
      {children}
    </Grid>
  )
}

export function VaultChangesInformationArrow() {
  return <Icon name="arrow_right_light" size="auto" width="10px" height="7px" sx={{ mx: 2 }} />
}

export function EstimationError({ withBrackets }: { withBrackets: boolean }) {
  const textError = 'n/a'
  return <Text sx={{ color: 'critical100' }}>{withBrackets ? `(${textError})` : textError}</Text>
}

export function getEstimatedGasFeeText(gasEstimation?: HasGasEstimation, withBrackets = false) {
  if (!gasEstimation) {
    return <EstimationError withBrackets={withBrackets} />
  }

  const { gasEstimationStatus, gasEstimationUsd } = gasEstimation

  switch (gasEstimationStatus) {
    case GasEstimationStatus.calculating:
      const textPending = 'Pending...'

      return (
        <Text sx={{ color: 'neutral80' }}>{withBrackets ? `(${textPending})` : textPending}</Text>
      )
    case GasEstimationStatus.error:
    case GasEstimationStatus.unknown:
    case GasEstimationStatus.unset:
    case undefined:
      return <EstimationError withBrackets={withBrackets} />
    case GasEstimationStatus.calculated:
      const textGas = `$${formatAmount(gasEstimationUsd as BigNumber, 'USD')}`

      return withBrackets ? `(${textGas})` : textGas
  }
}

export function VaultChangesInformationEstimatedGasFee(props: HasGasEstimation) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationItem
      label={t('max-gas-fee')}
      value={getEstimatedGasFeeText(props)}
      tooltip={<Box>{t('gas-explanation')}</Box>}
    />
  )
}
