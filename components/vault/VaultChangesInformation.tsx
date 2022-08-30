import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Flex, Grid, Text } from '@theme-ui/components'
import { GasEstimationContext } from 'components/GasEstimationContextProvider'
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
        sx={{ color: 'neutral80', justifyContent: 'flex-end', alignItems: 'center' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Text variant="paragraph4" sx={{ lineHeight: '16px', color: 'inherit' }}>
          {label}
        </Text>
        {tooltip && <Icon name="question_o" size="20px" sx={{ ml: 1 }} />}
      </Flex>
      {tooltip && tooltipOpen && (
        <Tooltip sx={{ transform: 'translateY(60%)', top: -230, right: ['0px', 'auto'] }}>
          {tooltip}
        </Tooltip>
      )}
      <Box sx={{ color: 'primary100' }}>
        <Text as="div" variant="paragraph4">
          {value}
        </Text>
      </Box>
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
  return (
    <Text as="div" sx={{ color: 'critical100' }}>
      {withBrackets ? `(${textError})` : textError}
    </Text>
  )
}

export function getEstimatedGasFeeTextOld(gasEstimation?: HasGasEstimation, withBrackets = false) {
  if (!gasEstimation) {
    return <EstimationError withBrackets={withBrackets} />
  }

  switch (gasEstimation.gasEstimationStatus) {
    case GasEstimationStatus.calculating:
      const textPending = 'Pending...'

      return (
        <Text sx={{ color: 'neutral80' }}>{withBrackets ? `(${textPending})` : textPending}</Text>
      )
    case GasEstimationStatus.error:
    case GasEstimationStatus.unknown:
    case GasEstimationStatus.unset:
      return <EstimationError withBrackets={withBrackets} />
    case GasEstimationStatus.calculated:
      const textGas = `$${formatAmount(gasEstimation.gasEstimationUsd!, 'USD')}`

      return withBrackets ? `(${textGas})` : textGas
  }
}

export function getEstimatedGasFeeText(gasEstimation?: GasEstimationContext, withBrackets = false) {
  const { t } = useTranslation()

  if (!gasEstimation) {
    return 'n/a'
  }
  const status: GasEstimationStatus = gasEstimation.isCompleted
    ? gasEstimation.isSuccessful
      ? GasEstimationStatus.calculated
      : GasEstimationStatus.error
    : GasEstimationStatus.calculating

  switch (status) {
    case GasEstimationStatus.calculating:
      const textPending = t('pending')

      return (
        <Text as="span" sx={{ color: 'neutral80' }}>
          {withBrackets ? `(${textPending})` : textPending}
        </Text>
      )
    case GasEstimationStatus.error:
    case undefined:
      return <EstimationError withBrackets={withBrackets} />
    case GasEstimationStatus.calculated:
      const textGas = `$${formatAmount(gasEstimation?.usdValue, 'USD')}`

      return withBrackets ? `(${textGas})` : textGas
  }
}

export function VaultChangesInformationEstimatedGasFee(props: HasGasEstimation) {
  const { t } = useTranslation()
  return (
    <VaultChangesInformationItem
      label={t('max-gas-fee')}
      value={getEstimatedGasFeeTextOld(props)}
      tooltip={<Box>{t('gas-explanation')}</Box>}
    />
  )
}
